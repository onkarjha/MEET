
$(document).ready(function () {
 $(".colors>div").click(function(){
var c=$(this).attr("title");console.log(c);
$(".fill").text(c);
 });          $(".lines>div").click(function(){
var c=$(this).attr("title");console.log(c);
$(".stroke_").text(c);
 });
   $(".tools > div").click(function () {
      $(".tools > div").css({ "background": "#fff" });
      $(this).css({ "background": "#efefef" });
   });
});

var data;
const can = document.getElementById("canvas");
$(can).attr("height", window.innerHeight);
$(can).attr("width", window.innerWidth);

const canvas = new fabric.Canvas(can, {
   isDrawingMode: false,  // Initially drawing mode is off
});

fabric.Object.ownDefaults.transparentCorners = false;

$(".tools > div").click(function () {
   data = $(this).attr("title");
   var width = 200;
   var height = 200;
   var left = (window.innerWidth-200)/2;
   var top = (window.innerHeight-200)/2;
   var angle = 0;
   var fill = $(".fill").text();
   var stroke = $(".stroke").text();
   var strokeWidth = parseInt($(".stroke_").text());

   var commonConfig = {
      left: left,
      top: top,
      angle: angle,
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
   };
   canvas.isDrawingMode = false;
   switch (data) {
     
      case "square":
       canvas.isDrawingMode = false;
         canvas.add(new fabric.Rect({
            width: width,
            height: height,
            ...commonConfig
         }));


         sendMessage({ 'message':{ width: width, height: height, ...commonConfig },
         'shape':data,
         });


         
         break;

      case "circle":
         canvas.add(new fabric.Circle({
            radius: 50,
            ...commonConfig
         }));
         break;

      case "triangle":
         canvas.add(new fabric.Triangle({
            width: width,
            height: height,
            ...commonConfig
         }));
         break;

         case "font":
canvas.add(new fabric.Textbox('Add Your Text Here', {
left: left,
top: top,
width: width,
fontSize: 30,
editable: true,
backgroundColor: 'transparent',
borderColor: 'gray',
fontFamily: 'Courier Prime', // Custom font
fill: 'black'
}));
break;


      case "pencil":
         canvas.isDrawingMode = true;
         const pencilBrush = new fabric.PencilBrush(canvas);
         pencilBrush.color = $(".stroke").text();
         pencilBrush.width = parseInt($(".stroke_").text());
         canvas.freeDrawingBrush = pencilBrush;

         break;
         case "fill":
           $(".colors").toggle();
           break;
           case "stroke":
           $(".lines").toggle();
           break;
           case "delete":
var selectedObject = canvas.getActiveObject();
if (selectedObject) {
canvas.remove(selectedObject);
canvas.discardActiveObject();
canvas.renderAll();
} else {
alert("No object selected for deletion.");
}
break;

   }
});

canvas.on({
   'object:moving': onChange,
   'object:scaling': onChange,
   'object:rotating': onChange,
   'object:skewing': onChange,
});

const hit = new fabric.Circle({
   radius: 5,
   originX: 'center',
   originY: 'center',
   opacity: 0.5,
});

function onChange({ target }) {
   target.setCoords();
   const ctx = canvas.getTopContext();
   canvas.clearContext(ctx);
   canvas.forEachObject((obj) => {
      if (obj === target) {
         obj.set('opacity', 1);
         return;
      }
      const intersection = fabric.Intersection.intersectPolygonPolygon(
         target.getCoords(true),
         obj.getCoords(true)
      );

      hit.set({ fill: obj.fill });
      if (
         intersection.status === 'Intersection' ||
         intersection.status === 'Coincident' ||
         obj.isContainedWithinObject(target, true) ||
         target.isContainedWithinObject(obj, true)
      ) {
         obj.set('opacity', 1);
         ctx.save();
         ctx.transform(...canvas.viewportTransform);
         hit.transform(ctx);
         intersection.points.forEach(({ x, y }) => {
            ctx.save();
            ctx.translate(x, y);
            hit._render(ctx);
            ctx.restore();
         });
         ctx.restore();
      } else {
         obj.set('opacity', 1);
      }
   });
}
