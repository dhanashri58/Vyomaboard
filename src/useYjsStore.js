import { useEffect, useState } from 'react'
import {
	createTLStore,
	defaultShapeUtils,
	InstancePresenceRecordType
} from 'tldraw'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

// We need to pass custom shape utils into the store!
import { CardShapeUtil } from './shapes/CardShapeUtil';
import { ListShapeUtil } from './shapes/ListShapeUtil';
import { FileShapeUtil } from './shapes/FileShapeUtil';
import { FolderShapeUtil } from './shapes/FolderShapeUtil';
import { ChartShapeUtil } from './shapes/ChartShapeUtil';

export function useYjsStore({ roomId, hostUrl, userName, userColor, shapeUtils = [] }) {
	const [store] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils, ...shapeUtils] }))
	const [storeWithStatus, setStoreWithStatus] = useState({ status: 'loading', store: null, provider: null })

	useEffect(() => {
		setStoreWithStatus({ status: 'loading', store: null, provider: null })

		const yDoc = new Y.Doc({ gc: true })
		const yMap = yDoc.getMap(`tl_${roomId}`)
		
		const token = localStorage.getItem('token');
		const roomWithToken = token ? `${roomId}?token=${token}` : roomId;
		
		const provider = new WebsocketProvider(hostUrl, roomWithToken, yDoc, { connect: false })
		const unsubs = []

		provider.on('sync', (isSynced) => {
			if (isSynced) handleSync()
		})

		provider.connect()

		function handleSync() {
			try {
				// 1. Initial sync
				const records = Array.from(yMap.values())
				if (records.length > 0) {
					store.mergeRemoteChanges(() => {
						store.put(records)
					})
				}

				// 2. Sync local to remote
				unsubs.push(
					store.listen(
						({ changes }) => {
							yDoc.transact(() => {
								Object.values(changes.added).forEach((record) => {
									yMap.set(record.id, record)
								})
								Object.values(changes.updated).forEach(([_, record]) => {
									yMap.set(record.id, record)
								})
								Object.values(changes.removed).forEach((record) => {
									yMap.delete(record.id)
								})
							}, 'local') // Mark transaction as local
						},
						{ source: 'user', scope: 'document' }
					)
				)

				// 3. Sync remote to local
				yMap.observe((event, transaction) => {
					if (transaction.origin === 'local') return; // Do not echo local changes back to Tldraw!
					store.mergeRemoteChanges(() => {
						event.changes.keys.forEach((change, key) => {
							if (change.action === 'add' || change.action === 'update') {
								const record = yMap.get(key)
								if (record) store.put([record])
							} else if (change.action === 'delete') {
								store.remove([key])
							}
						})
					})
				})
				
				setStoreWithStatus({
					store,
					status: 'synced-remote',
					connectionStatus: 'online',
					provider,
				})
			} catch (error) {
				console.error('Yjs sync failed', error)
			}
		}

		// Presence (Cursors and Names)
		unsubs.push(
			store.listen(
				() => {
					// We must generate an InstancePresence record to broadcast our cursor
					const presence = store.get(InstancePresenceRecordType.createId(store.id))
					if (!presence) return
					
					// Override presence to hide Tldraw's default canvas cursors and show them via our custom DOM layer
					const overriddenPresence = {
						...presence,
						meta: { ...presence.meta, realColor: presence.color, realName: presence.userName },
						color: '#00000000', // Transparent
						userName: ' ' // Empty space so default name tag doesn't show
					}
					
					provider.awareness.setLocalStateField('presence', overriddenPresence)
					provider.awareness.setLocalStateField('authUserId', localStorage.getItem('userId'))
				},
				{ source: 'user', scope: 'presence' }
			)
		)

		provider.awareness.on('update', () => {
			const states = provider.awareness.getStates()
			const records = []
			states.forEach((state, clientId) => {
				if (clientId !== provider.awareness.clientID && state.presence && state.presence.typeName) {
					records.push(state.presence)
				}
			})
			store.mergeRemoteChanges(() => {
				store.put(records)
			})
		})

		return () => {
			unsubs.forEach((fn) => fn())
			provider.disconnect()
			yDoc.destroy()
		}
	}, [store, roomId, hostUrl])

	return storeWithStatus
}
