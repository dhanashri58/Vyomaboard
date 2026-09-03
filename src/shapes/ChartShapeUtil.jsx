import React, { useEffect, useRef, useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { BarChart as BarIcon, LineChart as LineIcon, PieChart as PieIcon, GitMerge } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import mermaid from 'mermaid';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444', '#3b82f6'];

export class ChartShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-chart';
  
  static props = {
    w: T.number,
    h: T.number,
    chartType: T.string,
    chartData: T.string,
    mermaidCode: T.string,
  };

  getDefaultProps() {
    return {
      w: 400,
      h: 300,
      chartType: 'bar', // 'bar', 'line', 'pie', 'mermaid'
      chartData: JSON.stringify([
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
      ]),
      mermaidCode: 'graph TD\n  A-->B;\n  A-->C;\n  B-->D;\n  C-->D;'
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { chartType, chartData, mermaidCode, w, h } = shape.props;
    const [parsedData, setParsedData] = useState([]);
    const mermaidRef = useRef(null);

    useEffect(() => {
      try {
        if (chartType !== 'mermaid') {
          setParsedData(JSON.parse(chartData));
        }
      } catch (e) {
        console.error("Invalid chart data", e);
      }
    }, [chartData, chartType]);

    useEffect(() => {
      if (chartType === 'mermaid' && mermaidRef.current) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        const safeId = `mermaid-${shape.id.replace(/:/g, '-')}`;
        mermaid.render(safeId, mermaidCode).then((result) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = result.svg;
          }
        }).catch(err => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<div style="color: red; padding: 20px;">Syntax Error: ${err.message}</div>`;
          }
        });
      }
    }, [mermaidCode, chartType, shape.id, w, h]);

    const renderChart = () => {
      if (chartType === 'mermaid') {
        return <div ref={mermaidRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />;
      }

      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parsedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      if (chartType === 'line') {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={parsedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      if (chartType === 'pie') {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={parsedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={Math.min(w, h) / 2.5} label>
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      return <div>Unknown Chart Type</div>;
    };

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
          border: '1px solid #333',
          width: '100%',
          height: '100%',
        }}
      >
        <div 
          style={{ 
            height: '32px', 
            background: '#2d2d2d', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: '1px solid #444',
            cursor: 'grab'
          }}
          onPointerDown={(e) => {
             // Let Tldraw handle dragging
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e0e0e0', fontSize: '12px', fontWeight: '500' }}>
            {chartType === 'bar' && <BarIcon size={14} color="#8884d8" />}
            {chartType === 'line' && <LineIcon size={14} color="#8884d8" />}
            {chartType === 'pie' && <PieIcon size={14} color="#8884d8" />}
            {chartType === 'mermaid' && <GitMerge size={14} color="#8884d8" />}
            <span style={{ textTransform: 'capitalize' }}>{chartType === 'mermaid' ? 'Diagram' : `${chartType} Chart`}</span>
          </div>
          
          <button 
            style={{ 
              background: 'var(--accent)', 
              border: 'none', 
              color: 'white', 
              borderRadius: '4px', 
              padding: '2px 8px', 
              fontSize: '11px', 
              cursor: 'pointer' 
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('spawn-chart-editor', {
                detail: { shapeId: shape.id, chartType, chartData, mermaidCode }
              }));
            }}
          >
            Edit Data
          </button>
        </div>

        <div style={{ flex: 1, padding: '12px', overflow: 'hidden' }}>
          {renderChart()}
        </div>
      </HTMLContainer>
    );
  }
}
