import React, {FC, useEffect, useRef, useState} from 'react';
import * as ReactDOM from 'react-dom';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkLineWidget from '@kitware/vtk.js/Widgets/Widgets3D/LineWidget';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';

class VtkState {
  private readonly elem: HTMLElement;
  private readonly resizeObserver: ResizeObserver;

  public readonly renderWindow: vtkRenderWindow;
  public readonly renderer: vtkRenderer;
  public readonly widgetManager: vtkWidgetManager;

  constructor(elem: HTMLElement) {
    if (!elem) throw Error('useref');
    this.elem = elem;
    this.renderWindow = vtkRenderWindow.newInstance();
    this.renderer = vtkRenderer.newInstance();
    this.renderWindow.addRenderer(this.renderer);

    const openGL = vtkOpenGLRenderWindow.newInstance();
    openGL.setContainer(elem);
    this.renderWindow.addView(openGL);

    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    interactor.setView(openGL);
    interactor.initialize();
    interactor.bindEvents(elem);

    this.widgetManager = vtkWidgetManager.newInstance();
    this.widgetManager.setRenderer(this.renderer);
    this.renderer.resetCamera();
    this.renderWindow.render();

    this.resizeObserver = new ResizeObserver(() => {
      const dims = elem.getBoundingClientRect();
      openGL.setSize(
        Math.floor(dims.width),
        Math.floor(dims.height),
      )
      this.renderWindow.render();
    });
    this.resizeObserver.observe(elem);
  }

  public delete(): void {
    this.resizeObserver.unobserve(this.elem);
  }
}

const Example: FC<{}> = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const [vtkState, setVtkState] = useState<VtkState | null>(null);
  const [showWidget, setShowWidget] = useState<boolean>(false);

  useEffect(() => {
    const state = new VtkState(canvas.current);
    setVtkState(state);
    return () => state.delete();
  }, []);

  const widget = useRef<vtkLineWidget | null>(null);
  useEffect(()=> {
    if (!showWidget) {
      if (vtkState && widget.current) {
        widget.current.delete();
        widget.current = null;
        vtkState.widgetManager.removeWidgets();
      }
      return;
    }
    if (!vtkState || widget.current) return;

    const lineWidget = vtkLineWidget.newInstance();
    widget.current = lineWidget;
    const handle = vtkState.widgetManager.addWidget(lineWidget as any) as any;
    const state = lineWidget.getWidgetState();
    const state1 = state.getHandle1();
    // Note: any change to state{1,2} doesn't make any visual difference.
    state1.setVisible(true);
    state1.setShape('cone');
    state1.setScale1(10.0);
    handle.updateHandleVisibility(0);

    const state2 = state.getHandle2();
    state2.setShape('cone');
    state2.setVisible(true);
    handle.updateHandleVisibility(1);

    handle.getInteractor().render();
    vtkState.widgetManager.grabFocus(lineWidget as any);
    vtkState.renderWindow.render();
  }, [showWidget]);
  return (
    <>
      <div>
        Hello
        <button onClick={() => setShowWidget(true)}>Line widget</button>
        <button onClick={() => setShowWidget(false)}>Hide widget</button>
        <div
          ref={canvas}
          style={{
            height: '80vh',
            width: '80vw',
          }}
        />
      </div>
    </>
  );
}

const rootContainer = document.getElementById('root');
ReactDOM.unmountComponentAtNode(rootContainer as Element);
ReactDOM.render(
  <Example />,
  rootContainer,
);
