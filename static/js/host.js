$(document).ready(function() {
    $(".colors>div").click(function() {
        var c = $(this).attr("title");
        $(".fill").text(c);
        var current = canvas.getActiveObject();
        current.set({
            fill: c
        }); // Update the shape's data
        current.setCoords(); // Recalculate the coordinates of the object's bounding box
        canvas.renderAll();
        sendShapeUpdate(current);
    });

    $(".lines>div").click(function() {
        var c = $(this).attr("title");
        $(".stroke_").text(c);

    });

    $(".tools > div").click(function() {
        $(".tools > div").css("background", "#fff");
        $(this).css("background", "#efefef");
    });
});

const can = document.getElementById("canvas");
$(can).attr({
    height: window.innerHeight,
    width: window.innerWidth
});

const canvas = new fabric.Canvas(can, {
    isDrawingMode: false,
});

fabric.Object.ownDefaults.transparentCorners = false;


function generateShapeID() {
    const currentDate = new Date();
    const timestamp = currentDate.getTime(); // Get the current time in milliseconds
    const randomFiveDigit = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    return `${timestamp}${randomFiveDigit}`;
}


// Common shape properties
function getCommonConfig() {
    return {
        type: "NEW",
        width: 100,
        height: 100,
        left: (window.innerWidth - 200) / 2,
        top: (window.innerHeight - 200) / 2,
        angle: 0,
        fill: $(".fill").text(),
        stroke: $(".stroke").text(),
        strokeWidth: parseInt($(".stroke_").text()),
        id: generateShapeID(),
        radius: 50
    };
}

// Helper function to add shape and send message
function addShapeToCanvas(shapeType, additionalConfig) {
    const config = getCommonConfig();
    const shapeConfig = {
        ...config,
        ...additionalConfig
    };

    let shape;
    switch (shapeType) {
        case "square":

            shape = new fabric.Rect(shapeConfig);
            canvas.add(shape);
            sendMessage({
                'message': {
                    collab_id: $(".collab_id").text(),
                    sender: $(".sender").text(),
                    ...shapeConfig
                },
                'shape': shapeType
            });
            break;
        case "circle":
            shape = new fabric.Circle(shapeConfig);
            canvas.add(shape);
            sendMessage({
                'message': {
                    collab_id: $(".collab_id").text(),
                    sender: $(".sender").text(),
                    ...shapeConfig
                },
                'shape': shapeType
            });
            break;
        case "triangle":
            shape = new fabric.Triangle(shapeConfig);
            canvas.add(shape);
            sendMessage({
                'message': {
                    collab_id: $(".collab_id").text(),
                    sender: $(".sender").text(),
                    ...shapeConfig
                },
                'shape': shapeType
            });
            break;
        case "font":
            var da={
                left: shapeConfig.left,
                type_:"NEW",
                top: shapeConfig.top,
                width: 200,
                fontSize: 30,
                editable: true,
                backgroundColor: 'transparent',
                borderColor: 'gray',
                fontFamily: 'Courier Prime',
                fill: 'black',
                what:"font_",
                id: generateShapeID(),
            };
            shape = new fabric.Textbox('TEXT HERE', da);
            canvas.add(shape);
            sendMessage({
                'message': {
                    collab_id: $(".collab_id").text(),
                    sender: $(".sender").text(),
                    ...da
                },
                'shape': shapeType
            });
            break;
        default:
            return;
    }

   
}

// Event handling for tools
$(".tools > div").click(function() {
    const collab_id = $(".collab_id").text();
    const sender = $(".sender").text();
    const shapeType = $(this).attr("title");

    if (sender == "False") {
        alert("You are not logged in!");
        window.location.href = `${window.location.protocol}//${window.location.host}/auth/login`;
        return;
    }
    if (collab_id == "False") {
        alert("Please Provide Collab ID and Password to join!");
        window.location.href = `${window.location.protocol}//${window.location.host}/collab/check`;
        return;
    }

    switch (shapeType) {
        case "square":
            canvas.isDrawingMode = false;
        case "circle":
            canvas.isDrawingMode = false;
        case "triangle":
            canvas.isDrawingMode = false;
        case "font":
            canvas.isDrawingMode = false;
            addShapeToCanvas(shapeType);
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
            const selectedObject = canvas.getActiveObject();
            if (selectedObject) {
                var id = selectedObject.id;
                sendMessage({
                    'message': {
                        collab_id: $(".collab_id").text(),
                        sender: $(".sender").text(),
                        id: id,
                        type: "delete",
                    },
                    'shape': "delete",
                });
                canvas.remove(selectedObject);
                canvas.discardActiveObject();
                canvas.renderAll();
            } else {
                alert("No object selected for deletion.");
            }
            break;
    }
});

// Event listeners for shape updates (move, scale, rotate)
const sendShapeUpdate = (target) => {
    const shapeData = {
        collab_id: $(".collab_id").text(),
        sender: $(".sender").text(),
        shape: target.type,
        id: target.id,
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height,
        radius: target.radius,
        fill: target.fill,
        stroke: target.stroke,
        strokeWidth: target.strokeWidth,
        angle: target.angle,
        opacity: target.opacity,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        
        type: "UPDATE",
    };
    //console.log("SENDING UPDATE ID : " + target.id);
    sendMessage({
        'message': shapeData,
        'shape': target.type
    });
};

canvas.on('path:created', function(event) {
    const path = event.path;
    var id_=generateShapeID();
    path["id"]=id_;
    const pathData = {
        type: 'path', 
        path: path.get('path'),
        fill: path.fill, 
        stroke: path.stroke, 
        strokeWidth: path.strokeWidth,
        id: id_,
    };var da={
        message: {
            collab_id: $(".collab_id").text(),
            sender: $(".sender").text(),
            type: "NEW", 
            shape: 'path',
            
            data: pathData,
        },
        shape: 'path'
    };
    sendMessage(da);
});
canvas.on('text:changed', function(e) {
    var textbox = e.target; 
   
    var da={
        message: {
            collab_id: $(".collab_id").text(),
            sender: $(".sender").text(),
            type: "UPDATE", 
            id:textbox.id,
            
            text: textbox.text,
        },
        shape: 'font',
    };
    sendMessage(da);
  //  console.log(da);
});

canvas.on({
    'object:moving': function(event) {
        
        sendShapeUpdate(event.target);
    },
    'object:scaling': function(event) {
        sendShapeUpdate(event.target);
    },
    'object:rotating': function(event) {
        sendShapeUpdate(event.target);
    },
    'object:skewing': function(event) {
    }
});

// Collision detection
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