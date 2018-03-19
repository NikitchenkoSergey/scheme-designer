<h1>Scheme designer</h1>
<p>Constructor for interactive schemes on canvas <br />
Demo: <a href="http://nikitchenko.ru/scheme-designer/examples/">http://nikitchenko.ru/scheme-designer/examples/</a>
</p>

<p align=center><img src="http://nikitchenko.ru/scheme-designer/scheme-designer.gif" width="600"></p>

<h2>Features</h2>
<ul>
    <li>No dependencies</li>
    <li>Render only visible objects</li>
    <li>Layers support</li>
    <li>Responsible</li>
    <li>Objects stored in search tree</li>
    <li>Touch support</li>
    <li>Many api methods and events</li>
</ul>

<h2>Usage Instructions</h2>
1. Link file:

```
<script src="dist/scheme-designer.min.js"></script>
```

2. Add Markup
```
<canvas id="canvas" width="800" height="500"></canvas>
```
for adaptive add wrapper (relative):
```
 <div style="width: 100%; height: 500px; position:relative;">
       <canvas id="canvas"></canvas>
 </div>
```

3. Init, create layers, add objects to layers and render (see examples)
```
var defaultLayer = new SchemeDesigner.Layer('default', {zIndex: 1});

var schemeObject = new SchemeDesigner.SchemeObject({
            x: 0.5 + leftOffset,
            y: 0.5 + topOffset,
            width: width,
            height: height,
            renderFunction: renderPlace
});

defaultLayer.addObject(schemeObject);

var canvas = document.getElementById('canvas');
var schemeDesigner = new SchemeDesigner.Scheme(canvas, {
    options: {
        cacheSchemeRatio: 2
    },
    scroll: {
        maxHiddenPart: 0.85
    },
    zoom: {
        padding: 0.1,
        maxScale: 8,
        zoomCoefficient: 1.04
    },
    storage: {
        treeDepth: 6
    }
});

schemeDesigner.addLayer(defaultLayer);

schemeDesigner.render();
```

<h2>Options</h2>
<h3>Scheme</h3>
<table>
    <tr>
        <th>Option</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
     <tr>
        <td colspan=3 align=center><strong>Options</strong></td>
    </tr>
     <tr>
        <td>cacheSchemeRatio</td>
        <td>2</td>
        <td>Ratio for scheme cache. Set false to disable cache.</td>
    </tr>
    <tr>
        <td colspan=3 align=center><strong>Scroll</strong></td>
    </tr>
     <tr>
        <td>maxHiddenPart</td>
        <td>0.85</td>
        <td>Max hidden part on scroll</td>
    </tr>
    <tr>
        <td colspan=3 align=center><strong>Zoom</strong></td>
    </tr>
     <tr>
        <td>padding</td>
        <td>0.1</td>
        <td>Padding from objects to canvas border</td>
    </tr>
    <tr>
        <td>maxScale</td>
        <td>5</td>
        <td>Max sale</td>
    </tr>
    <tr>
        <td>zoomCoefficient</td>
        <td>1.04</td>
        <td>Zoom coefficient (Math.pow(zoomCoefficient, delta))</td>
    </tr>
    <tr>
        <td colspan=3 align=center><strong>Storage</strong></td>
    </tr>
     <tr>
        <td>treeDepth</td>
        <td>0.6</td>
        <td>Depth of search tree</td>
    </tr>
</table>

<h3>Layer</h3>
<table>
    <tr>
        <th>Option</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
     <tr>
        <td>zIndex: number</td>
        <td>0</td>
        <td>Z index</td>
    </tr>
    <tr>
        <td>visible: boolean</td>
        <td>true</td>
        <td>Layer is visible</td>
    </tr>
    <tr>
        <td>active: boolean</td>
        <td>true</td>
        <td>Layer is active: objects can process events</td>
    </tr>
</table>

<h3>SchemeObject</h3>
<table>
    <tr>
        <th>Option</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
     <tr>
        <td>x: number</td>
        <td></td>
        <td>X position</td>
    </tr>
    <tr>
        <td>width: number</td>
        <td></td>
        <td>Width</td>
    </tr>
    <tr>
        <td>height: number</td>
        <td></td>
        <td>Height</td>
    </tr>
     <tr>
        <td>rotation: number</td>
        <td>0</td>
        <td>Rotation</td>
    </tr>
     <tr>
        <td>active: boolean</td>
        <td>true</td>
        <td>Active object can hanlde events.</td>
    </tr>
     <tr>
        <td>cursorStyle: string</td>
        <td>pointer</td>
        <td>Cursor style on object</td>
    </tr>
    <tr>
        <td>renderFunction: Function(schemeObject: SchemeObject, scheme: Scheme, view: View)</td>
        <td></td>
        <td>Function for rendering object, see examples</td>
    </tr>
    <tr>
        <td>clickFunction: Function(schemeObject: SchemeObject, scheme: Scheme, view: View, e: Event)</td>
        <td></td>
        <td>Function for handle click on object</td>
    </tr>
    <tr>
        <td>mouseOverFunction: Function(schemeObject: SchemeObject, scheme: Scheme, view: View, e: Event)</td>
        <td></td>
        <td>Function for handle mouseover on object</td>
    </tr>
   <tr>
       <td>mouseLeaveFunction: Function(schemeObject: SchemeObject, scheme: Scheme, view: View, e: Event)</td>
       <td></td>
       <td>Function for handle mouseleave on object</td>
   </tr>
     <tr>
       <td>clearFunction: Function(schemeObject: SchemeObject, scheme: Scheme, view: View)</td>
       <td></td>
       <td>Function for clear object on scheme cache</td>
   </tr>
</table>

<h2>Api</h2>

Examples:
```
var schemeDesigner = new SchemeDesigner.Scheme(canvas);

SchemeDesigner.setCursorStyle('move');
schemeDesigner.getZoomManager().zoomToCenter(10);
schemeDesigner.getScrollManager().scroll(100, 200);
schemeDesigner.getStorageManager().showNodesParts();
schemeDesigner.getStorageManager().setLayerVisibility('background', true);
```


<table>
    <tr>
        <th>Method</th>
        <th>Return</th>
        <th>Description</th>
    </tr>
     <tr>
        <td colspan=3 align=center><strong>SchemeDesigner</strong></td>
    </tr>
    <tr>
        <td>getEventManager()</td>
        <td>EventManager</td>
        <td></td>
    </tr>
    <tr>
        <td>getScrollManager()</td>
        <td>ScrollManager</td>
        <td></td>
    </tr>
    <tr>
        <td>getZoomManager()</td>
        <td>ZoomManager</td>
        <td></td>
    </tr>
    <tr>
        <td>getStorageManager()</td>
        <td>StorageManager</td>
        <td></td>
    </tr>
     <tr>
        <td>getWidth()</td>
        <td>number</td>
        <td>Scheme width</td>
    </tr>
    <tr>
        <td>getHeight()</td>
        <td>number</td>
        <td>Scheme height</td>
    </tr>
    <tr>
        <td>clearContext()</td>
        <td>SchemeDesigner</td>
        <td>Clear canvas context</td>
    </tr>
    <tr>
        <td>requestRenderAll()</td>
        <td>SchemeDesigner</td>
        <td>Request redraw canvas</td>
    </tr>
    <tr>
        <td>requestDrawFromCache()</td>
        <td>SchemeDesigner</td>
        <td>Request draw scheme from cache</td>
    </tr>
    <tr>
        <td>render()</td>
        <td></td>
        <td>Request redraw canvas, create search tree and scroll with zoom to center</td>
    </tr>
        <tr>
        <td>getCanvas()</td>
        <td>HTMLCanvasElement</td>
        <td>Canvas element</td>
    </tr>
    <tr>
        <td>getCanvas2DContext()</td>
        <td>CanvasRenderingContext2D</td>
        <td>Canvas context</td>
    </tr>
     <tr>
        <td>setCursorStyle(cursor: string)</td>
        <td>SchemeDesigner</td>
        <td>Set cursor style</td>
    </tr>
     <tr>
        <td>updateCache(onlyChanged: boolean)</td>
        <td></td>
        <td>Redraw scheme cache</td>
    </tr>
    <tr>
        <td>getView()</td>
        <td>View</td>
        <td>Main view</td>
    </tr>
    <tr>
        <td>addChangedObject(schemeObject: SchemeObject)</td>
        <td></td>
        <td>Add object to changed list for redraw cache</td>
    </tr>
     <tr>
        <td colspan=3 align=center><strong>Layer</strong></td>
    </tr>
    <tr>
        <td>getObjects()</td>
        <td>SchemeObject[]</td>
        <td>Get all objects</td>
    </tr>
    <tr>
        <td>addObject(object: SchemeObject)</td>
        <td></td>
        <td>Add object</td>
    </tr>
    <tr>
        <td>removeObject(object: SchemeObject)</td>
        <td></td>
        <td>Remove object</td>
    </tr>
    <tr>
        <td>removeObjects()</td>
        <td></td>
        <td>Remove all objects</td>
    </tr>
    <tr>
        <td>setZIndex(value: number)</td>
        <td></td>
        <td>Set z-index</td>
    </tr>
    <tr>
        <td>setActive(value: boolean)</td>
        <td></td>
        <td>Set active flag</td>
    </tr>
    <tr>
        <td>setVisible(value: boolean)</td>
        <td></td>
        <td>Set visible flag</td>
    </tr>
    <tr>
        <td colspan=3 align=center><strong>Scroll manager</strong></td>
    </tr>
     <tr>
        <td>getScrollLeft()</td>
        <td>number</td>
        <td>Left offset</td>
    </tr>
    <tr>
        <td>getScrollTop()</td>
        <td>number</td>
        <td>Top offset</td>
    </tr>
    <tr>
        <td>scroll(left: number, top: number)</td>
        <td></td>
        <td>Set scroll</td>
    </tr>
    <tr>
        <td>toCenter()</td>
        <td></td>
        <td>Scroll to objects center</td>
    </tr>
    <tr>
        <td>setMaxHiddenPart(value: number)</td>
        <td></td>
        <td>Set maxHiddenPart</td>
    </tr>
    <tr>
        <td colspan=3 align=center><strong>Zoom manager</strong></td>
    </tr>
    <tr>
        <td>zoom(delta: number)</td>
        <td>boolean</td>
        <td>Zoom scheme if posible</td>
    </tr>
    <tr>
        <td>setScale(scale: number)</td>
        <td>boolean</td>
        <td>Set scale if posible</td>
    </tr>
    <tr>
        <td>getScaleWithAllObjects()</td>
        <td>number</td>
        <td>Get scale when all objects are visible</td>
    </tr>
    <tr>
        <td>zoomByFactor(factor: number)</td>
        <td>boolean</td>
        <td>Zoom by factor if posible</td>
    </tr>
    <tr>
        <td>getScale()</td>
        <td>number</td>
        <td>Current scale</td>
    </tr>
    <tr>
        <td>zoomToCenter(delta: number)</td>
        <td></td>
        <td>Zoom to center</td>
    </tr>
    <tr>
        <td>zoomToPoint(point: Coordinates, delta: number)</td>
        <td></td>
        <td>Zoom to point</td>
    </tr>
    <tr>
        <td>setPadding(value: number)</td>
        <td></td>
        <td>Set padding</td>
    </tr>
    <tr>
        <td>setMaxScale(value: number)</td>
        <td></td>
        <td>Set maxScale</td>
    </tr>
    <tr>
        <td>setZoomCoefficient(value: number)</td>
        <td></td>
        <td>Set zoomCoefficient </td>
    </tr>
     <tr>
        <td colspan=3 align=center><strong>Storage manager</strong></td>
    </tr>
     <tr>
        <td>addLayer(layer: Layer)</td>
        <td></td>
        <td>Add layer</td>
    </tr>
    <tr>
        <td>removeLayers()</td>
        <td></td>
        <td>Remove all layers</td>
    </tr>
    <tr>
        <td>removeLayer(layerId: string)</td>
        <td></td>
        <td>Remove layer by id</td>
    </tr>
     <tr>
        <td>setLayerVisibility(layerId: string, visible: boolean)</td>
        <td></td>
        <td>Set layer visibility and rerender scheme</td>
    </tr>
     <tr>
        <td>setLayerActivity(layerId: string, activity: boolean)</td>
        <td></td>
        <td>Set layer activity</td>
    </tr>
    <tr>
        <td>findObjectsByCoordinates(coordinates: Coordinates)</td>
        <td>SchemeObject[]</td>
        <td>Find objects by coordinates</td>
    </tr>
    <tr>
        <td>getObjectsBoundingRect()</td>
        <td>BoundingRect</td>
        <td>Bounding rect of all objects</td>
    </tr>
    <tr>
        <td>reCalcObjectsBoundingRect()</td>
        <td></td>
        <td>Request fo recalculate bounding rect of all objects</td>
    </tr>
    <tr>
        <td>setTreeDepth(value: number)</td>
        <td></td>
        <td>Set treeDepth</td>
    </tr>
    <tr>
        <td>requestBuildTree()</td>
        <td></td>
        <td>Request rebuild search tree</td>
    </tr>
    <tr>
        <td>getTree()</td>
        <td>TreeNode</td>
        <td>Get root tree node</td>
    </tr>
    <tr>
        <td>applyStructureChange()</td>
        <td></td>
        <td>Recalculate all cructure dependencies</td>
    </tr>
    <tr>
        <td>showNodesParts()</td>
        <td></td>
        <td>Draw rect of nodes for testing</td>
    </tr>
</table>


<h2>Events</h2>

<table>
    <tr>
        <th>Event</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>schemeDesigner.beforeRenderAll</td>
        <td>Before render all</td>
    </tr>
        <tr>
        <td>schemeDesigner.afterRenderAll</td>
        <td>After render all</td>
    </tr>
        <tr>
        <td>schemeDesigner.clickOnObject</td>
        <td>Click on object</td>
    </tr>
        <tr>
        <td>schemeDesigner.mouseOverObject</td>
        <td>Mouse over on object</td>
    </tr>
        <tr>
        <td>schemeDesigner.mouseLeaveObject</td>
        <td>Mouse leave from object</td>
    </tr>
        <tr>
        <td>schemeDesigner.scroll</td>
        <td>On scroll</td>
    </tr>
    <tr>
        <td>schemeDesigner.zoom</td>
        <td>On zoom</td>
    </tr>
</table>

<h2>Donation</2>
<p>PayPal: <a href="https://www.paypal.me/NikitchenkoSergey/25">nikitchenko.sergey@yandex.ru</a></p>
<p>Yandex.Money: <a href="https://money.yandex.ru/to/410011704835851/200">410011704835851</a></p>
