import React, { useCallback, useState, useEffect } from 'react';
import { 
  Tldraw, 
  createTLStore, 
  defaultShapeUtils, 
  createShapeId,
  DefaultToolbar,
  ToolbarItem,
  useEditor,
  AssetRecordType,
  TldrawUiPopover,
  TldrawUiPopoverTrigger,
  TldrawUiPopoverContent,
  DefaultContextMenu,
  DefaultContextMenuContent,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  TldrawUiMenuSubmenu,
  useActions,
  useValue
} from 'tldraw';
import 'tldraw/tldraw.css';
import { Loader2, Type, CheckSquare, Image as ImageIcon, Layout, Terminal, Settings, Folder, FileCode, Phone, MessageSquare, Mic, Video, VideoOff, MicOff, Pin, PieChart, Sparkles, Pen, Square } from 'lucide-react';
import { NOTE_COLORS } from '../shapes/ShapeColors';
import { db, storage } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CardShapeUtil } from '../shapes/CardShapeUtil';
import { ListShapeUtil } from '../shapes/ListShapeUtil';
import { FileShapeUtil } from '../shapes/FileShapeUtil';
import { FolderShapeUtil } from '../shapes/FolderShapeUtil';
import CustomMultiplayerCursors from '../components/CustomMultiplayerCursors';
import { ChartShapeUtil } from '../shapes/ChartShapeUtil';
import { BrandGuidelinesShapeUtil } from '../shapes/BrandGuidelinesShapeUtil';
import { VisionBoardShapeUtil } from '../shapes/VisionBoardShapeUtil';
import { WeeklyPlannerShapeUtil } from '../shapes/WeeklyPlannerShapeUtil';
import { EmpathyMapShapeUtil } from '../shapes/EmpathyMapShapeUtil';
import { BrainDumpShapeUtil } from '../shapes/BrainDumpShapeUtil';
import { EisenhowerMatrixShapeUtil } from '../shapes/EisenhowerMatrixShapeUtil';
import { BusinessModelCanvasShapeUtil } from '../shapes/BusinessModelCanvasShapeUtil';
import { TimelineShapeUtil } from '../shapes/TimelineShapeUtil';
import { MindMapNodeShapeUtil } from '../shapes/MindMapNodeShapeUtil';
import { CodeRunnerShapeUtil } from '../shapes/CodeRunnerShapeUtil';
import { ProductDesignShapeUtil } from '../shapes/ProductDesignShapeUtil';
import { UserStorymapShapeUtil } from '../shapes/UserStorymapShapeUtil';
import { CustomerJourneyMapShapeUtil } from '../shapes/CustomerJourneyMapShapeUtil';
import { RetrospectiveShapeUtil } from '../shapes/RetrospectiveShapeUtil';
import FileViewerModal from '../FileViewerModal';
import FolderViewerModal from '../FolderViewerModal';
import ChartEditorModal from '../ChartEditorModal';
import ThemeSettingsModal from '../ThemeSettingsModal';
import CallManager from '../components/CallManager';
import GroupChat from '../components/GroupChat';
import TemplatesModal from '../components/TemplatesModal';
import ChoiceFileModal from '../components/ChoiceFileModal';
import { useYjsStore } from '../useYjsStore';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const customShapeUtils = [
  CardShapeUtil, ListShapeUtil, FileShapeUtil, FolderShapeUtil, ChartShapeUtil,
  BrandGuidelinesShapeUtil, VisionBoardShapeUtil, WeeklyPlannerShapeUtil, EmpathyMapShapeUtil, BrainDumpShapeUtil,
  EisenhowerMatrixShapeUtil, BusinessModelCanvasShapeUtil, TimelineShapeUtil, MindMapNodeShapeUtil,
  CodeRunnerShapeUtil, ProductDesignShapeUtil, UserStorymapShapeUtil, CustomerJourneyMapShapeUtil, RetrospectiveShapeUtil
];

const CustomToolbar = (props) => {
  const [showChartMenu, setShowChartMenu] = React.useState(false);
  const editor = useEditor();

  const handleChartClick = (type, e) => {
    if (e) e.stopPropagation();
    setShowChartMenu(false);
    if (!editor) return;

    const center = editor.getViewportPageBounds().center;
    editor.createShape({
      id: createShapeId(),
      type: 'milanote-chart',
      x: center.x,
      y: center.y,
      props: { chartType: type }
    });
  };

  return (
    <>
    <DefaultToolbar {...props}>
      <TldrawUiPopover id="chart-menu">
        <TldrawUiPopoverTrigger>
          <button 
            className="tlui-button tlui-button__tool"
            title="Insert Chart"
          >
            <span className="tlui-button__icon">
              <PieChart size={20} />
            </span>
          </button>
        </TldrawUiPopoverTrigger>
        <TldrawUiPopoverContent side="top" align="center" sideOffset={8}>
          <div style={{
            background: 'var(--color-panel)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.8)',
            width: '180px',
            pointerEvents: 'all'
          }}>
            <button className="tool-btn" style={{ justifyContent: 'flex-start' }} onPointerDown={(e) => handleChartClick('bar', e)}>
              <span style={{ fontSize: '13px' }}>Bar Chart</span>
            </button>
            <button className="tool-btn" style={{ justifyContent: 'flex-start' }} onPointerDown={(e) => handleChartClick('line', e)}>
              <span style={{ fontSize: '13px' }}>Line Chart</span>
            </button>
            <button className="tool-btn" style={{ justifyContent: 'flex-start' }} onPointerDown={(e) => handleChartClick('pie', e)}>
              <span style={{ fontSize: '13px' }}>Pie Chart</span>
            </button>
            <button className="tool-btn" style={{ justifyContent: 'flex-start' }} onPointerDown={(e) => handleChartClick('mermaid', e)}>
              <span style={{ fontSize: '13px' }}>Flowchart (Mermaid)</span>
            </button>
          </div>
        </TldrawUiPopoverContent>
      </TldrawUiPopover>

      <ToolbarItem tool="select" />
      <ToolbarItem tool="hand" />
      <ToolbarItem tool="text" />
      <ToolbarItem tool="note" />
      <ToolbarItem tool="asset" />

      {/* Draw Tools Menu */}
      <TldrawUiPopover id="draw-menu">
        <TldrawUiPopoverTrigger>
          <button className="tlui-button tlui-button__tool" title="Draw Tools">
            <span className="tlui-button__icon">
              <Pen size={18} />
            </span>
          </button>
        </TldrawUiPopoverTrigger>
        <TldrawUiPopoverContent side="top" align="center" sideOffset={8}>
          <div style={{ background: 'var(--color-panel)', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'row', gap: '4px' }}>
            <ToolbarItem tool="draw" />
            <ToolbarItem tool="highlight" />
            <ToolbarItem tool="laser" />
            <ToolbarItem tool="eraser" />
          </div>
        </TldrawUiPopoverContent>
      </TldrawUiPopover>

      {/* Shapes Menu */}
      <TldrawUiPopover id="shapes-menu">
        <TldrawUiPopoverTrigger>
          <button className="tlui-button tlui-button__tool" title="Shapes">
            <span className="tlui-button__icon">
              <Square size={18} />
            </span>
          </button>
        </TldrawUiPopoverTrigger>
        <TldrawUiPopoverContent side="top" align="center" sideOffset={8}>
          <div style={{ background: 'var(--color-panel)', padding: '4px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
            <ToolbarItem tool="rectangle" />
            <ToolbarItem tool="ellipse" />
            <ToolbarItem tool="triangle" />
            <ToolbarItem tool="diamond" />
            <ToolbarItem tool="hexagon" />
            <ToolbarItem tool="oval" />
            <ToolbarItem tool="rhombus" />
            <ToolbarItem tool="star" />
            <ToolbarItem tool="cloud" />
            <ToolbarItem tool="heart" />
            <ToolbarItem tool="x-box" />
            <ToolbarItem tool="check-box" />
            <ToolbarItem tool="arrow-left" />
            <ToolbarItem tool="arrow-up" />
            <ToolbarItem tool="arrow-down" />
            <ToolbarItem tool="arrow-right" />
          </div>
        </TldrawUiPopoverContent>
      </TldrawUiPopover>

      <ToolbarItem tool="arrow" />
      <ToolbarItem tool="line" />
      <ToolbarItem tool="frame" />
    </DefaultToolbar>
    </>
  );
};
const customUiOverrides = {
  actions(editor, actions) {
    const allActions = {
      ...actions,
      'create-file': {
        id: 'create-file',
        label: 'Create File',
        readonlyOk: false,
        kbd: '',
        onSelect(source) {
          const name = prompt('Enter new file name with extension (e.g. main.c, script.js):', 'New_File.c');
          if (!name) return;
          const center = editor.getViewportPageBounds().center;
          editor.createShape({
            id: createShapeId(),
            type: 'milanote-file',
            x: center.x,
            y: center.y,
            props: { name }
          });
        }
      },

      'rename-item': {
        id: 'rename-item',
        label: 'Rename',
        readonlyOk: false,
        kbd: '',
        onSelect(source) {
          const selected = editor.getSelectedShapes();
          if (selected.length === 1 && (selected[0].type === 'milanote-file' || selected[0].type === 'milanote-folder')) {
            const shape = selected[0];
            const newName = prompt('Enter new name:', shape.props.name);
            if (newName) {
              editor.updateShape({ id: shape.id, type: shape.type, props: { name: newName } });
            }
          }
        }
      },
      'act-branch-top': { id: 'act-branch-top', label: 'Add Branch (Top)', readonlyOk: false, kbd: '', onSelect() { const selected = editor.getSelectedShapes(); if(selected[0]) MindMapNodeShapeUtil.spawnNodeAtAngle(editor, selected[0], 270); } },
      'act-branch-bottom': { id: 'act-branch-bottom', label: 'Add Branch (Bottom)', readonlyOk: false, kbd: '', onSelect() { const selected = editor.getSelectedShapes(); if(selected[0]) MindMapNodeShapeUtil.spawnNodeAtAngle(editor, selected[0], 90); } },
      'act-branch-left': { id: 'act-branch-left', label: 'Add Branch (Left)', readonlyOk: false, kbd: '', onSelect() { const selected = editor.getSelectedShapes(); if(selected[0]) MindMapNodeShapeUtil.spawnNodeAtAngle(editor, selected[0], 180); } },
      'act-branch-right': { id: 'act-branch-right', label: 'Add Branch (Right)', readonlyOk: false, kbd: '', onSelect() { const selected = editor.getSelectedShapes(); if(selected[0]) MindMapNodeShapeUtil.spawnNodeAtAngle(editor, selected[0], 0); } },
      'act-branch-custom': { id: 'act-branch-custom', label: 'Add Branch (Custom Angle...)', readonlyOk: false, kbd: '', onSelect() { const selected = editor.getSelectedShapes(); if(selected[0]) { const angle = prompt("Enter angle in degrees (0-360):", "45"); if (angle && !isNaN(angle)) MindMapNodeShapeUtil.spawnNodeAtAngle(editor, selected[0], Number(angle)); } } },
      ...Object.fromEntries(['rounded', 'rectangle', 'circle', 'oval', 'rhombus', 'trapezium', 'dotted'].map(s => {
        const labelText = s === 'rounded' ? 'Rounded Rectangle' : (s.charAt(0).toUpperCase() + s.slice(1));
        return [
          `act-shape-${s}`, { id: `act-shape-${s}`, label: `Shape: ${labelText}`, readonlyOk: false, kbd: '', onSelect() { const sel = editor.getSelectedShapes(); if(sel[0]) editor.updateShape({ id: sel[0].id, type: sel[0].type, props: { nodeShape: s } }); } }
        ];
      })),
      ...Object.fromEntries([
        { id: 'rel-1-1', label: 'One to One', start: 'none', end: 'none', dash: 'draw' },
        { id: 'rel-1-many', label: 'One to Many', start: 'none', end: 'inverted', dash: 'draw' },
        { id: 'rel-many-1', label: 'Many to One', start: 'inverted', end: 'none', dash: 'draw' },
        { id: 'rel-many-many', label: 'Many to Many', start: 'inverted', end: 'inverted', dash: 'draw' },
        { id: 'rel-depends', label: 'Dependency (Dotted)', start: 'none', end: 'arrow', dash: 'dashed' }
      ].map(r => [
        `act-${r.id}`, { id: `act-${r.id}`, label: r.label, readonlyOk: false, kbd: '', onSelect() { const sel = editor.getSelectedShapes(); if(sel[0]) editor.updateShape({ id: sel[0].id, type: sel[0].type, props: { arrowheadStart: r.start, arrowheadEnd: r.end, dash: r.dash } }); } }
      ])),
      'act-link-files': {
        id: 'act-link-files',
        label: 'Link Selected Files to Code',
        readonlyOk: false,
        kbd: '',
        onSelect() {
          const selected = editor.getSelectedShapes();
          const codeRunners = selected.filter(s => s.type === 'milanote-code-runner');
          const files = selected.filter(s => s.type === 'milanote-file');
          
          if (codeRunners.length === 1 && files.length > 0) {
            const runner = codeRunners[0];
            files.forEach(file => {
              const arrowId = createShapeId();
              editor.createShape({
                id: arrowId,
                type: 'arrow',
                props: {
                  start: { x: 0, y: 0 },
                  end: { x: 0, y: 0 },
                  bend: 0.25,
                  dash: 'draw'
                }
              });
              editor.createBinding({
                type: 'arrow',
                fromId: arrowId,
                toId: file.id,
                props: { terminal: 'start', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false }
              });
              editor.createBinding({
                type: 'arrow',
                fromId: arrowId,
                toId: runner.id,
                props: { terminal: 'end', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false }
              });
            });
          }
        }
      },
      'act-spawn-code-runner': {
        id: 'act-spawn-code-runner',
        label: 'Create Code Runner from C File',
        readonlyOk: false,
        kbd: '',
        async onSelect() {
          const selected = editor.getSelectedShapes();
          const files = selected.filter(s => s.type === 'milanote-file');
          const cFiles = files.filter(s => s.props.name?.endsWith('.c'));
          
          if (cFiles.length === 1) {
            const cFile = cFiles[0];
            const otherFiles = files.filter(s => s.id !== cFile.id);
            
            // Fetch the C code content
            try {
              const res = await fetch(cFile.props.url);
              const code = await res.text();
              
              const newRunnerId = createShapeId();
              editor.createShape({
                id: newRunnerId,
                type: 'milanote-code-runner',
                x: cFile.x + 200,
                y: cFile.y,
                props: { code, language: 'c' }
              });
              
              // Link all selected files to the runner
              files.forEach(file => {
                const arrowId = createShapeId();
                editor.createShape({
                  id: arrowId,
                  type: 'arrow',
                  props: {
                    start: { x: 0, y: 0 },
                    end: { x: 0, y: 0 },
                    bend: 0.25,
                    dash: 'draw'
                  }
                });
                editor.createBinding({
                  type: 'arrow',
                  fromId: arrowId,
                  toId: file.id,
                  props: { terminal: 'start', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false }
                });
                editor.createBinding({
                  type: 'arrow',
                  fromId: arrowId,
                  toId: newRunnerId,
                  props: { terminal: 'end', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false, isPrecise: false }
                });
              });
            } catch (err) {
              console.error('Failed to create code runner', err);
            }
          }
        }
      }
    };

    // Add color actions dynamically
    Object.keys(NOTE_COLORS).forEach(color => {
      const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
      allActions[`color-${color}`] = {
        id: `color-${color}`,
        label: `Color: ${colorCapitalized}`,
        readonlyOk: false,
        kbd: '',
        onSelect(source) {
          const selected = editor.getSelectedShapes();
          selected.forEach(shape => {
            if (shape.type === 'milanote-card' || shape.type === 'milanote-list') {
              editor.updateShape({ id: shape.id, type: shape.type, props: { color } });
            }
          });
        }
      };
    });

    return allActions;
  }
};

const CustomContextMenu = (props) => {
  const editor = useEditor();
  const actions = useActions();
  const selected = useValue('selectedShapes', () => editor.getSelectedShapes(), [editor]);
  
  return (
    <DefaultContextMenu {...props}>
      { (
        (selected.length === 1 && ['mind-map-node', 'arrow', 'milanote-file', 'milanote-folder'].includes(selected[0].type)) ||
        (selected.length > 0 && selected.every(s => s.type === 'milanote-card' || s.type === 'milanote-list')) ||
        (selected.length === 0) ||
        (selected.some(s => s.type === 'milanote-code-runner') && selected.some(s => s.type === 'milanote-file')) ||
        (selected.every(s => s.type === 'milanote-file') && selected.filter(s => s.props.name?.endsWith('.c')).length === 1)
      ) && (
        <TldrawUiMenuGroup id="custom-stuff">
          {selected.length === 1 && selected[0].type === 'mind-map-node' && (
            <>
              <TldrawUiMenuSubmenu id="mind-map-branch" label="Add Branch">
                <TldrawUiMenuItem {...actions['act-branch-top']} />
                <TldrawUiMenuItem {...actions['act-branch-bottom']} />
                <TldrawUiMenuItem {...actions['act-branch-left']} />
                <TldrawUiMenuItem {...actions['act-branch-right']} />
                <TldrawUiMenuItem {...actions['act-branch-custom']} />
              </TldrawUiMenuSubmenu>
              <TldrawUiMenuSubmenu id="mind-map-shape" label="Change Shape">
                <TldrawUiMenuItem {...actions['act-shape-rounded']} />
                <TldrawUiMenuItem {...actions['act-shape-rectangle']} />
                <TldrawUiMenuItem {...actions['act-shape-circle']} />
                <TldrawUiMenuItem {...actions['act-shape-oval']} />
                <TldrawUiMenuItem {...actions['act-shape-rhombus']} />
                <TldrawUiMenuItem {...actions['act-shape-trapezium']} />
                <TldrawUiMenuItem {...actions['act-shape-dotted']} />
              </TldrawUiMenuSubmenu>
            </>
          )}

          {selected.length === 1 && selected[0].type === 'arrow' && (
            <>
              <TldrawUiMenuItem {...actions['act-rel-1-1']} />
              <TldrawUiMenuItem {...actions['act-rel-1-many']} />
              <TldrawUiMenuItem {...actions['act-rel-many-1']} />
              <TldrawUiMenuItem {...actions['act-rel-many-many']} />
              <TldrawUiMenuItem {...actions['act-rel-depends']} />
            </>
          )}

          {selected.some(s => s.type === 'milanote-code-runner') && selected.some(s => s.type === 'milanote-file') && (
            <TldrawUiMenuItem {...actions['act-link-files']} />
          )}

          {selected.every(s => s.type === 'milanote-file') && selected.filter(s => s.props.name?.endsWith('.c')).length === 1 && (
            <TldrawUiMenuItem {...actions['act-spawn-code-runner']} />
          )}

          {selected.length === 1 && (selected[0].type === 'milanote-file' || selected[0].type === 'milanote-folder') && (
            <TldrawUiMenuItem {...actions['rename-item']} />
          )}



          {selected.length === 0 && (
            <TldrawUiMenuItem {...actions['create-file']} />
          )}
        </TldrawUiMenuGroup>
      )}
      <DefaultContextMenuContent />
    </DefaultContextMenu>
  );
};

const customComponents = {
  InFrontOfTheCanvas: CustomMultiplayerCursors,
  CursorChatBubble: () => null,
  SharePanel: null,
  MenuPanel: null,
  NavigationPanel: null,
  HelpMenu: null,
  DebugPanel: null,
  DebugMenu: null,
  Toolbar: CustomToolbar,
  ContextMenu: CustomContextMenu
};
export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [placingTemplate, setPlacingTemplate] = useState(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [editor, setEditor] = useState(null);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeChartEditor, setActiveChartEditor] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showChoiceFileModal, setShowChoiceFileModal] = useState(false);
  
  const localUserId = localStorage.getItem('userId');
  
  // Communication States
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallHidden, setIsCallHidden] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Anonymous');

  // Theme State
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [boardType, setBoardType] = useState(() => localStorage.getItem('themeBoard') || 'pinboard');
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('themeAccent');
    return saved ? JSON.parse(saved) : { id: 'periwinkle', hex: '#92a9e1', hover: '#92a9e1' };
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('themeBoard', boardType);
    localStorage.setItem('themeAccent', JSON.stringify(accentColor));

    document.body.setAttribute('data-mode', mode);
    document.body.setAttribute('data-board', boardType);
    document.documentElement.style.setProperty('--accent', accentColor.hex);
    document.documentElement.style.setProperty('--accent-hover', accentColor.hover);
    
    if (editor) {
      editor.user.updateUserPreferences({ colorScheme: mode, color: accentColor.hex });
    }
  }, [mode, boardType, accentColor, editor]);

  const handleSelectTemplate = (template) => {
    setPlacingTemplate(template);
    setShowTemplatesModal(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && placingTemplate) {
        setPlacingTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placingTemplate]);

  // Yjs Sync Store
  const storeWithStatus = useYjsStore({
    roomId: id || 'global-moodboard',
    hostUrl: import.meta.env.VITE_YJS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/yjs`,
    userName: userName || 'Anonymous',
    userColor: '#ef4444',
    shapeUtils: customShapeUtils,
  });

  useEffect(() => {
    if (id) {
      const fetchRoom = async () => {
        try {
          const roomRef = doc(db, 'rooms', id);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            setRoomInfo(roomSnap.data());
          } else {
            // Room doesn't exist, redirect to home
            navigate('/');
          }
        } catch (e) {
          console.error(e);
          navigate('/');
        }
      };
      fetchRoom();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!editor) return;

    const handleSpawnPreview = (e) => {
      const { url, name, ext, pages, originShapeId, isCloudFile, content } = e.detail;
      const originShape = editor.getShape(originShapeId);
      if (!originShape) return;
      setActivePreviewFile({ url, name, ext, fileId: e.detail.fileId, isCloudFile, content, originShapeId });
    };

    const handleSpawnFolder = (e) => {
      setActiveFolder(e.detail);
    };

    const handleSpawnChartEditor = (e) => {
      setActiveChartEditor(e.detail);
    };

    const handleProfileUpdate = (e) => {
      const newName = e.detail;
      setUserName(newName);
      if (editor) {
        editor.user.updateUserPreferences({ name: newName });
      }
    };

    window.addEventListener('spawn-preview', handleSpawnPreview);
    window.addEventListener('spawn-folder-view', handleSpawnFolder);
    window.addEventListener('spawn-chart-editor', handleSpawnChartEditor);
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('spawn-preview', handleSpawnPreview);
      window.removeEventListener('spawn-folder-view', handleSpawnFolder);
      window.removeEventListener('spawn-chart-editor', handleSpawnChartEditor);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [editor]);

  const handleMount = useCallback((editorInstance) => {
    setEditor(editorInstance);
    
    // Intercept deleteShapes to prevent the eraser from deleting anything
    const originalDeleteShapes = editorInstance.deleteShapes;
    editorInstance.deleteShapes = (ids) => {
      const currentTool = editorInstance.getCurrentToolId();
      if (currentTool === 'eraser') {
        return;
      }
      return originalDeleteShapes.call(editorInstance, ids);
    };

    // Template Anti-Overlap Physics on Drag & Drop
    const findSafeLocation = (targetX, targetY, myW, myH, existingShapes) => {
      let radius = 0;
      const step = 200;
      const margin = 50;
      while (radius < 5000) {
        // Evaluate points in a circle (or just the origin if radius is 0)
        const angles = radius === 0 ? [0] : [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
        for (const angle of angles) {
          const testX = targetX + radius * Math.cos(angle);
          const testY = targetY + radius * Math.sin(angle);
          const testRight = testX + myW;
          const testBottom = testY + myH;
          
          let hasCollision = false;
          for (const other of existingShapes) {
            const otherW = other.props?.w || 1000;
            const otherH = other.props?.h || 1000;
            const otherRight = other.x + otherW;
            const otherBottom = other.y + otherH;
            
            const intersect = !(testRight + margin <= other.x || testX >= otherRight + margin || testBottom + margin <= other.y || testY >= otherBottom + margin);
            if (intersect) {
              hasCollision = true;
              break;
            }
          }
          if (!hasCollision) return { x: testX, y: testY };
        }
        radius += step;
      }
      return { x: targetX, y: targetY };
    };
    editorInstance.sideEffects.registerAfterChangeHandler('shape', (prev, next, source) => {
      if (source !== 'user') return;
      const templateTypes = [
        'brand-guidelines', 'vision-board', 'weekly-planner', 'empathy-map', 'brain-dump',
        'eisenhower-matrix', 'business-model-canvas', 'timeline', 'product-design', 'user-storymap', 'customer-journey', 'retrospective'
      ];
      if (!templateTypes.includes(next.type)) return;
      
      if (prev.x !== next.x || prev.y !== next.y) {
        const shapes = editorInstance.getCurrentPageShapes().filter(s => s.id !== next.id && templateTypes.includes(s.type));
        const myW = next.props?.w || 1000;
        const myH = next.props?.h || 1000;
        const safeLoc = findSafeLocation(next.x, next.y, myW, myH, shapes);
        const newX = safeLoc.x;
        const newY = safeLoc.y;
        
        if (newX !== next.x || newY !== next.y) {
           setTimeout(() => {
              editorInstance.updateShape({ id: next.id, type: next.type, props: next.props, x: newX, y: newY });
           }, 0);
        }
      }
    });
    
    editorInstance.updateInstanceState({ isGridMode: true });
    editorInstance.user.updateUserPreferences({ 
      name: userName || 'Anonymous',
      color: '#ef4444' 
    });
    
    // Set base point using the current camera position
    if (storeWithStatus.provider && storeWithStatus.provider.awareness) {
      const camera = editorInstance.getCamera();
      storeWithStatus.provider.awareness.setLocalStateField('basePoint', { x: camera.x, y: camera.y });
    }
    
    editorInstance.registerExternalContentHandler('files', async ({ files, point }) => {
      if (files && files.length > 0) {
        const file = files[0];
        
        try {
          setIsUploading(true);
          setUploadMessage(`Uploading ${file.name}...`);
          
          const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);
          
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadMessage(`Uploading ${file.name}... ${Math.round(progress)}%`);
            },
            (error) => {
              console.error("Upload failed:", error);
              setIsUploading(false);
              alert("Failed to upload file to Firebase.");
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              
              const dropPoint = point ?? editorInstance.getViewportPageBounds().center;
              const ext = file.name.split('.').pop().toLowerCase();
              const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
              
              if (isImage) {
                const img = new Image();
                img.onload = () => {
                  const assetId = AssetRecordType.createId();
                  editorInstance.createAssets([{
                    id: assetId,
                    type: 'image',
                    typeName: 'asset',
                    props: {
                      name: file.name,
                      src: downloadURL,
                      w: img.width,
                      h: img.height,
                      mimeType: file.type || 'image/png',
                      isAnimated: file.name.toLowerCase().endsWith('.gif'),
                    },
                    meta: {}
                  }]);
                  editorInstance.createShape({
                    type: 'image',
                    x: dropPoint.x - (img.width / 2),
                    y: dropPoint.y - (img.height / 2),
                    props: {
                      assetId: assetId,
                      w: img.width,
                      h: img.height,
                    }
                  });
                };
                img.src = downloadURL;
              } else {
                editorInstance.createShape({
                  type: 'milanote-file',
                  x: dropPoint.x - 80,
                  y: dropPoint.y - 60,
                  props: {
                    name: file.name,
                    url: downloadURL,
                    pages: [],
                  }
                });
              }
            }
          );
        } catch (e) {
          console.error(e);
          setIsUploading(false);
        }
      }
    });
  }, []);

  const addShape = useCallback((type, chartTypeParam) => {
    if (!editor) return;
    
    let props = undefined;
    if (type === 'milanote-file') {
      setShowChoiceFileModal(true);
      return;
    } else if (type === 'milanote-chart') {
      props = { chartType: chartTypeParam || 'bar' };
    }

    const center = editor.getViewportPageBounds().center;
    editor.createShape({
      type: type,
      x: center.x - 125,
      y: center.y - 100,
      props: props
    });
  }, [editor]);



  if (storeWithStatus.status === 'loading' || !storeWithStatus.store) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: 'white' }}>
        <Loader2 size={32} className="spin" />
        <span style={{ marginLeft: '12px' }}>Connecting to Multiplayer Room...</span>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Top Bar Navigation (Top left corner) */}
      <TopBar 
        editor={editor} 
        provider={storeWithStatus.provider} 
        roomName={id || 'global'} 
        roomInfo={roomInfo}
        localUserId={localUserId}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        <div className={`milanote-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-tools">
          <button className="tool-btn" onClick={() => addShape('milanote-card')}>
            <Type size={20} />
            <span>Note</span>
          </button>
          <button className="tool-btn" onClick={() => addShape('milanote-list')}>
            <CheckSquare size={20} />
            <span>To-Do List</span>
          </button>
          <button className="tool-btn" onClick={() => addShape('milanote-file')}>
            <FileCode size={20} />
            <span>Create File</span>
          </button>
          <button className="tool-btn" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '*/*'; 
            input.multiple = true;
            input.onchange = (e) => {
              if (e.target.files && e.target.files.length > 0) {
                 editor.putExternalContent({ type: 'files', files: Array.from(e.target.files), point: editor.getViewportPageBounds().center, ignoreParent: false });
              }
            };
            input.click();
          }}>
            <ImageIcon size={20} />
            <span>Upload File</span>
          </button>
          <button className="tool-btn" onClick={() => setShowTemplatesModal(true)}>
            <Layout size={20} />
            <span>Templates</span>
          </button>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="tool-btn" onClick={() => setShowThemeSettings(true)}>
            <Settings size={20} />
            <span>Theme Settings</span>
          </button>
          
          <hr style={{ borderColor: 'var(--sidebar-border)', margin: '4px 0' }} />
          
          <button className="tool-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
            <MessageSquare size={20} />
            <span>Group Chat</span>
          </button>

          {!isCallActive ? (
            <button className="tool-btn" onClick={() => setIsCallActive(true)} style={{ background: 'rgba(35, 165, 89, 0.2)', borderColor: '#23a559' }}>
              <Phone size={20} color="#23a559" />
              <span style={{ color: '#23a559' }}>Voice Call</span>
            </button>
          ) : isCallHidden ? (
            <>
              {/* Active Call Controls pinned to bottom (Sidebar version) */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button 
                  onClick={() => setIsMicMuted(!isMicMuted)} 
                  style={{ flex: 1, background: isMicMuted ? '#da373c' : '#2b2d31', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                >
                  {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)} 
                  style={{ flex: 1, background: isVideoOff ? '#da373c' : '#2b2d31', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                >
                  {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button 
                  onClick={() => setIsCallHidden(!isCallHidden)} 
                  style={{ flex: 1, background: '#2b2d31', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {isCallHidden ? 'Unhide' : 'Hide'}
                </button>
                <button 
                  onClick={() => { setIsCallActive(false); setIsCallHidden(false); }} 
                  style={{ flex: 1, background: '#da373c', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                >
                  <Phone size={16} style={{ transform: 'rotate(135deg)' }} />
                </button>
              </div>
            </>
          ) : (
            <button className="tool-btn" onClick={() => setIsCallHidden(true)} style={{ background: '#2b2d31', borderColor: 'transparent', display: 'flex', justifyContent: 'center' }}>
               <span style={{ color: 'white', fontWeight: 'bold', margin: 'auto' }}>Hide Call</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {placingTemplate && (
          <div 
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 9999, cursor: 'crosshair',
              background: 'transparent'
            }}
            onPointerMove={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               setGhostPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onPointerDown={(e) => {
              if (!editor) return;
              const point = editor.screenToPage({ x: e.clientX, y: e.clientY });
              
              const templateTypes = [
                'brand-guidelines', 'vision-board', 'weekly-planner', 'empathy-map', 'brain-dump',
                'eisenhower-matrix', 'business-model-canvas', 'timeline', 'product-design', 'user-storymap', 'customer-journey', 'retrospective'
              ];
              const existingTemplates = editor.getCurrentPageShapes().filter(s => templateTypes.includes(s.type));
              
              const shapes = placingTemplate.createShapes(point);
              editor.createShapes(shapes);
              setPlacingTemplate(null);
              
              // Check collision for spawned templates
              const newShape = shapes[0];
              if (newShape && templateTypes.includes(newShape.type)) {
                 const myW = newShape.props?.w || 1000;
                 const myH = newShape.props?.h || 1000;
                 const safeLoc = findSafeLocation(newShape.x, newShape.y, myW, myH, existingTemplates);
                 const newX = safeLoc.x;
                 const newY = safeLoc.y;
                 if (newX !== newShape.x || newY !== newShape.y) {
                    editor.updateShape({ id: newShape.id, type: newShape.type, props: newShape.props, x: newX, y: newY });
                 }
              }
            }}
          >
            <div style={{
               position: 'absolute',
               left: ghostPos.x,
               top: ghostPos.y,
               transform: 'translate(-50%, -50%)',
               pointerEvents: 'none',
               border: '2px dashed var(--color-text)',
               background: 'rgba(88, 101, 242, 0.1)',
               padding: '40px 80px',
               borderRadius: '16px',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               backdropFilter: 'blur(4px)',
               boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--color-text)' }}>{placingTemplate.name}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Click anywhere to place</span>
            </div>
          </div>
        )}
        <div style={{ 
          width: '100%', 
          height: '100%', 
          visibility: ((isCallActive && !isCallHidden) || isChatOpen) ? 'hidden' : 'visible',
          opacity: ((isCallActive && !isCallHidden) || isChatOpen) ? 0 : 1,
          pointerEvents: ((isCallActive && !isCallHidden) || isChatOpen) ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}>
          <Tldraw
            store={storeWithStatus.store}
            shapeUtils={customShapeUtils}
          isDarkMode={
            boardType === 'blackboard' ? true : 
            boardType === 'whiteboard' ? false : 
            mode === 'dark'
          }
          onMount={handleMount}
          components={customComponents}
          overrides={customUiOverrides}
        />
        </div>

        {isUploading && (
           <div style={{ position: 'absolute', top: 20, right: 20, background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000 }}>
             <Loader2 size={18} className="spin" />
             <span style={{ fontWeight: 500 }}>Processing File...</span>
           </div>
        )}
      </div>

      {activePreviewFile && (
        <FileViewerModal 
          fileData={activePreviewFile} 
          onClose={() => setActivePreviewFile(null)}
          onSaveCloudFile={(newContent) => {
            if (activePreviewFile.originShapeId) {
              editor.updateShape({
                id: activePreviewFile.originShapeId,
                type: 'milanote-file',
                props: { content: newContent }
              });
              setActivePreviewFile({ ...activePreviewFile, content: newContent });
            }
          }}
        />
      )}

      {showChoiceFileModal && (
        <ChoiceFileModal 
          onClose={() => setShowChoiceFileModal(false)}
          onFileSelect={(files) => {
            setShowChoiceFileModal(false);
            const center = editor.getViewportPageBounds().center;
            files.forEach((file, index) => {
              editor.createShape({
                type: 'milanote-file',
                x: center.x - 125 + (index * 20),
                y: center.y - 100 + (index * 20),
                props: { name: file.name, isCloudFile: true, content: '' }
              });
            });
          }}
          onFileUpload={(files) => {
            setShowChoiceFileModal(false);
            editor.putExternalContent({ type: 'files', files: Array.from(files), point: editor.getViewportPageBounds().center, ignoreParent: false });
          }}
        />
      )}

      {showTemplatesModal && (
        <TemplatesModal 
          onClose={() => setShowTemplatesModal(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
      
      {activeFolder && (
        <FolderViewerModal 
          folderId={activeFolder.folderId}
          name={activeFolder.name}
          initialFiles={activeFolder.files}
          onClose={() => setActiveFolder(null)}
          editor={editor}
        />
      )}

      {activeChartEditor && (
        <ChartEditorModal
          shapeId={activeChartEditor.shapeId}
          initialChartType={activeChartEditor.chartType}
          initialChartData={activeChartEditor.chartData}
          initialMermaidCode={activeChartEditor.mermaidCode}
          onClose={() => setActiveChartEditor(null)}
          editor={editor}
        />
      )}

      {isCallActive && (
        <CallManager 
          isCallHidden={isCallHidden}
          isMicMuted={isMicMuted} 
          isVideoOff={isVideoOff} 
        />
      )}

      {/* Floating call controls when fullscreen */}
      {(isCallActive && !isCallHidden) && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          padding: '12px',
          background: 'rgba(30, 31, 34, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <button 
            onClick={() => setIsMicMuted(!isMicMuted)} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: isMicMuted ? '#da373c' : '#2b2d31', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: isVideoOff ? '#da373c' : '#2b2d31', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          
          <button 
            onClick={() => setIsCallHidden(!isCallHidden)} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2b2d31', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', transition: 'transform 0.1s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Hide
          </button>
          
          <button 
            onClick={() => { setIsCallActive(false); setIsCallHidden(false); }} 
            style={{ width: '64px', height: '48px', borderRadius: '24px', background: '#da373c', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Phone size={24} style={{ transform: 'rotate(135deg)' }} />
          </button>
        </div>
      )}

      </div>

      {isChatOpen && (
        <GroupChat onClose={() => setIsChatOpen(false)} />
      )}

      {showThemeSettings && (
        <ThemeSettingsModal 
          onClose={() => setShowThemeSettings(false)}
          mode={mode} setMode={setMode}
          boardType={boardType} setBoardType={setBoardType}
          accentColor={accentColor} setAccentColor={setAccentColor}
          isHost={roomInfo?.hostId === localUserId}
          editor={editor}
        />
      )}
    </div>
  );
}
