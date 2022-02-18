// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import DeepEqual from 'deep-equal';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkLineWidget from '@kitware/vtk.js/Widgets/Widgets3D/LineWidget';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';

import controlPanel from './controlPanel.html';

let nextId = 1;

// For regular objects, we store the ID in field _internalObjectId.  For frozen
// objects, we keep the IDs in a weakmap.
const frozenObjects = new WeakMap();

// Assigns a UID to an object. It return -1 for null.  For debugging only.
function objectId(obj) {
  if (obj == null) return -1;
  if (!Object.isExtensible(obj)) {
    let v = frozenObjects.get(obj);
    if (!v) {
      nextId += 1;
      v = nextId;
      frozenObjects.set(obj, v);
    }
    return v;
  }
  if (obj._internalObjectId == null) {
      nextId += 1;
      obj._internalObjectId = nextId;
  }
  return obj._internalObjectId;
}

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0.2, 0.3, 0.4],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Widget manager
// ----------------------------------------------------------------------------

const widgetManager = vtkWidgetManager.newInstance();
widgetManager.setRenderer(renderer);

let widget = null;
let widgetHandle = null;

renderer.resetCamera();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

// Text Modifiers ------------------------------------------

function updateLinePos() {
  const input = document.getElementById('linePos').value;
  const subState = widget.getWidgetState().getPositionOnLine();
  subState.setPosOnLine(input / 100);
  widgetHandle.placeText();
  renderWindow.render();
}

function updateText() {
  const input = document.getElementById('txtIpt').value;
  widgetHandle.setText(input);
  renderWindow.render();
}
document.querySelector('#txtIpt').addEventListener('keyup', updateText);

function observeDistance() {
    return;
  widgetHandle.onInteractionEvent(() => {
    document.getElementById('distance').innerHTML = widget
      .getDistance()
      .toFixed(2);
  });

  widgetHandle.onEndInteractionEvent(() => {
    document.getElementById('distance').innerHTML = widget
      .getDistance()
      .toFixed(2);
  });
}

document.querySelector('#linePos').addEventListener('input', updateLinePos);

function updateHandleShape(handleId) {
    const e = document.getElementById(`idh${handleId}`);
    const shape = e.options[e.selectedIndex].value;
    let handle = null;
    if (handleId == 1) {
        handle = widget.getWidgetState().getHandle1();
    } else if (handleId == 2) {
        handle = widget.getWidgetState().getHandle2();
    } else {
        throw Error(`invalid index ${index}`);
    }
    console.log(`SHAPE: ${handleId} ${shape}`);
    handle.setShape(shape);
    widgetHandle.updateHandleVisibility(handleId - 1);
    widgetHandle.getInteractor().render();
    observeDistance();
}

/*
function setWidgetColor(currentWidget, color) {
  currentWidget.getWidgetState().getHandle1().setColor(color);
  currentWidget.getWidgetState().getHandle2().setColor(color);
  currentWidget.getWidgetState().getMoveHandle().setColor(color);
}
*/

// shape change
if (false) {
    const inputHandle1 = document.getElementById('idh1');
    this.localRenderer.resetCamera();
    const inputHandle2 = document.getElementById('idh2');

    inputHandle1.addEventListener('input', updateHandleShape.bind(null, 1));
    inputHandle2.addEventListener('input', updateHandleShape.bind(null, 2));
}

// visibility change
if (false) {
    const checkBoxes = ['visiH1', 'visiH2'].map((id) =>
        document.getElementById(id)
    );

    const handleCheckBoxInput = (e) => {
        if (widgetHandle == null) {
            return;
        }
        if (e.target.id === 'visiH1') {
            widget.getWidgetState().getHandle1().setVisible(e.target.checked);
            widgetHandle.updateHandleVisibility(0);
        } else {
            widget.getWidgetState().getHandle2().setVisible(e.target.checked);
            widgetHandle.updateHandleVisibility(1);
        }
        widgetHandle.getInteractor().render();
        renderWindow.render();
    };
    checkBoxes.forEach((checkBox) =>
        checkBox.addEventListener('input', handleCheckBoxInput)
    );
}

document.querySelector('#addWidget').addEventListener('click', () => {
  widgetManager.releaseFocus(widget);
  widget = vtkLineWidget.newInstance();
  // widget.placeWidget(cube.getOutputData().getBounds());
  widgetHandle = widgetManager.addWidget(widget);

  updateHandleShape(1);
  updateHandleShape(2);

  observeDistance();

  widgetManager.grabFocus(widget);

  widgetHandle.onStartInteractionEvent(() => {
      // setWidgetColor(widget, 0.2);
    const state = widget.getWidgetState();
    const handle1 = state.getHandle1();
    const handle2 = state.getHandle2();
  });
});

document.querySelector('#removeWidget').addEventListener('click', () => {
    widgetManager.removeWidget(widget);
    widget = null;
    widgetHandle = null;
});

// -----------------------------------------------------------
// globals
// -----------------------------------------------------------
/*
global.widget = widget;
global.renderer = renderer;
global.fullScreenRenderer = fullScreenRenderer;
global.renderWindow = renderWindow;
global.widgetManager = widgetManager;
global.line = widgetHandle;
*/
