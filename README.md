<h1>Scheme designer</h1>
<p>Constructor for interactive schemes on canvas <br />
Demo: <a href="http://nikitchenko.ru/scheme-designer/examples/">http://nikitchenko.ru/scheme-designer/examples/</a>
</p>

<p><img src="http://nikitchenko.ru/scheme-designer/scheme-designer.gif" width="100%"></p>

<h2>Features</h2>
<ul>
    <li>No dependencies</li>
    <li>Render only visible objects</li>
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

3. Init, add objects and render (see examples)
```
var canvas = document.getElementById('canvas');
var schemeDesigner = new SchemeDesigner.Scheme(canvas, {
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

var schemeObject = new SchemeDesigner.SchemeObject({
            x: 0.5 + leftOffset,
            y: 0.5 + topOffset,
            width: width,
            height: height,
            renderFunction: renderPlace
});

schemeDesigner.addObject(schemeObject);

schemeDesigner.render();
```

<h2>Options</h2>
<table>
    <tr>
        <th>Option</th>
        <th>Default</th>
        <th>Description</th>
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
