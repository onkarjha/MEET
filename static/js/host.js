$(document).ready(function() {
   $(".colors>div").click(function() {
       var c = $(this).attr("title");
       console.log(c);
       $(".fill").text(c);
   });
   $(".lines>div").click(function() {
       var c = $(this).attr("title");
       console.log(c);
       $(".stroke_").text(c);
   });
   $(".tools > div").click(function() {
       $(".tools > div").css({
           "background": "#fff"
       });
       $(this).css({
           "background": "#efefef"
       });
   });
});

var data;
const can = document.getElementById("canvas");
$(can).attr("height", window.innerHeight);
$(can).attr("width", window.innerWidth);

const canvas = new fabric.Canvas(can, {
   isDrawingMode: false, // Initially drawing mode is off
});

fabric.Object.ownDefaults.transparentCorners = false;
let shapeCounter = 0; // Counter for unique shape ID

// Helper function to generate unique ID
function generateShapeID() {
    return `S${shapeCounter++}`;
}
$(".tools > div").click(function() {




   var collab_id = $(".collab_id").text();
   var sender = $(".sender").text();
   if (sender == "False") {
       alert("You are not logged in!");
       window.location.href = window.location.protocol + "//" + window.location.host + '/auth/login';
       return;
   }
   if (collab_id == "False") {
       alert("Please Provide Collab ID and Password to join!");
       window.location.href = window.location.protocol + "//" + window.location.host + '/collab/check';
       return;
   }




   data = $(this).attr("title");
   var width = 200;
   var height = 200;
   var left = (window.innerWidth - 200) / 2;
   var top = (window.innerHeight - 200) / 2;
   var angle = 0;
   var fill = $(".fill").text();
   var stroke = $(".stroke").text();
   var strokeWidth = parseInt($(".stroke_").text());

   var commonConfig = {
      type:"NEW",
       left: left,
       top: top,
       angle: angle,
       fill: fill,
       stroke: stroke,
       strokeWidth: strokeWidth,
       id:generateShapeID(),
   };
   console.log(commonConfig);
   canvas.isDrawingMode = false;
  // let shapeID = 
   switch (data) {

       case "square":
           canvas.isDrawingMode = false;
           canvas.add(new fabric.Rect({
               width: width,
               height: height,
               ...commonConfig
           }));


           sendMessage({
               'message': {
                   collab_id: collab_id,
                   sender: sender,
                   width: width,
                   height: height,
                   ...commonConfig
               },
               'shape': data,
           });



           break;

       case "circle":
           canvas.add(new fabric.Circle({
               radius: 50,
               ...commonConfig
           }));


           sendMessage({
               'message': {
                   collab_id: collab_id,
                   sender: sender,
                   radius: 50,
                   ...commonConfig
               },
               'shape': data,
           });
           break;

       case "triangle":
           canvas.add(new fabric.Triangle({
               width: width,
               height: height,
               ...commonConfig
           }));

           sendMessage({
               'message': {
                   collab_id: collab_id,
                   sender: sender,
                   width: width,
                   height: height,
                   ...commonConfig
               },
               'shape': data,
           });

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
   'object:moving': function(event) {
       const target = event.target;
       let shapeType = '';
       if (target.type == "rect") {
           shapeType = "square";
       } else if (target.type == "circle") {
           shapeType = "circle";
       } else if (target.type == "triangle") {
           shapeType = "triangle";
       }

       // Prepare a message with all relevant shape properties
       const shapeData = {
           collab_id: collab_id,
           sender: sender,
           shape: target.type,  // Shape type (e.g., rect, circle, etc.)
           id: target.id,       // Unique shape ID
           left: target.left,   // X position
           top: target.top,     // Y position
           width: target.width, // Width of the shape (if applicable)
           height: target.height, // Height of the shape (if applicable)
           radius: target.radius, // Radius (for circles)
           fill: target.fill,    // Fill color
           stroke: target.stroke, // Stroke color
           strokeWidth: target.strokeWidth, // Stroke width
           angle: target.angle,  // Rotation angle
           opacity: target.opacity, // Opacity
           scaleX: target.scaleX, // Scale in X direction
           scaleY: target.scaleY, // Scale in Y direction
           type: "UPDATE",  // Action type (this is an update)
       };

       // Log the message being sent (for debugging)
       console.log('Sending message with shape data:', shapeData);

       // Send the message with the shape data
       sendMessage({
           'message': shapeData,
           'shape': shapeType
       });



  
  
      },
   'object:scaling': function(event) {
       const target = event.target;
       console.log(`Shape: ${target.type},ID: ${target.id}, Resized to width: ${target.width}, height: ${target.height}`);
   },
   'object:rotating': function(event) {
       const target = event.target;
       console.log(`Shape: ${target.type}, ID: ${target.id},Rotated to angle: ${target.angle}`);
   },
   'object:skewing': function(event) {
       const target = event.target;
       console.log(`Shape: ${target.type},ID: ${target.id}, Skewed to angleX: ${target.skewX}, angleY: ${target.skewY}`);
   }
});

const hit = new fabric.Circle({
   radius: 5,
   originX: 'center',
   originY: 'center',
   opacity: 0.5,
});

function onChange({
   target
}) {
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

       hit.set({
           fill: obj.fill
       });
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
           intersection.points.forEach(({
               x,
               y
           }) => {
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