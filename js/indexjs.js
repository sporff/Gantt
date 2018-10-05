


// Generate an empty graph
function buildTimelineGraph(parentDivID, newGraphDivID, graphStruct)
{
    var parentDiv = $('#' + parentDivID);
    if (parentDiv.length === 0) {
        console.log("Error: Cannot find parent div!");
        return;
    }
    // Erase anything from parent and create new div inside
    parentDiv.html("");

    // Add the graph's main div
    parentDiv.append('<div id="graphwrapper_' + newGraphDivID + '" style=""></div>');
    var graphWrapperDiv = $('#graphwrapper_' + newGraphDivID);
    graphWrapperDiv.append('<div id="graphrowlegend_' + newGraphDivID + '" style="text-align:right;float: left; display:inline-block;background-color:#eee;">Work<br>Conveyor View<br>Missed Window<br>Zone Interruption<br>Unknown Container<br>something<br>something else</div>');
    graphWrapperDiv.append('<div id="' + newGraphDivID + '" style="display:inline-block;width:80%;margin: 0 auto; border: 1px solid black; border-radius: 5px;"></div>');
    var newGraphDiv = $('#' + newGraphDivID);

    // Save any data that will be needed later
    newGraphDiv.data( {
        title: graphStruct.title,
        rowHeight: graphStruct.rowHeight,
        border: graphStruct.border!=null ? graphStruct.border : "0px",
        cornerRadius: graphStruct.cornerRadius!=null ? graphStruct.cornerRadius : "0px",
        shadow: graphStruct.shadow===true ? graphStruct.shadow : false,
        onmouseover: graphStruct.onmouseover,
        onmouseleave: graphStruct.onmouseleave,
    } );

    // Add header
    var rowString = '<div id="'+ newGraphDivID +'_header" class="timelineRow timelineRowHeader"></div>';
    //newGraphDiv.append(rowString);
    console.log(rowString);
    

    for (r=0; r<graphStruct.rowStruct.length; r++)
    {
        // Get row id
        var rowID = graphStruct.rowStruct[r].id;
        var rowHeight = newGraphDiv.data().rowHeight;
        if (rowHeight == null)
            rowHeight = "20px";

        // Secondary class for odd/even
        if (r%2)
            rowClass = "timelineRowOdd";
        else
            rowClass = "timelineRowEven";
        
        // Add the html
        var rowString = '<div id="'+ rowID +'" class="timelineRow '+ rowClass +'"';
        rowString += ' style="'
        rowString += ' height: ' + rowHeight + ';';
        rowString += ' line-height: ' + rowHeight + ';';
        if (graphStruct.rowStruct[r].rowColor != null)
            rowString += ' background-color: ' + graphStruct.rowStruct[r].rowColor + ';"'
        rowString += '"></div>';
        newGraphDiv.append(rowString);

        //console.log(rowString);

        // Save the row info in the div's data field
        $('#'+ rowID).data(graphStruct.rowStruct[r]);
    }
}

// Generate bars in a row
function addTimelineBars(graphID, rowID, barData)
{
    var graphDiv = $('#' + graphID);
    var rowDiv = $('#' + rowID);
    var farthestEnd = 0;
    var overlapHeightTracker = 80;
    var opacityTracker = 1;
    if (rowDiv.length === 0 || graphDiv === 0) {
        console.log("Error: Cannot find graph or row!");
        return;
    }

    for (b=0; b<barData.length; b++)
    {
        var barStart = barData[b].start;
        var barEnd = barData[b].end;
        var barLen = barEnd - barStart;

        if (barEnd < barStart) {
            [barStart, barEnd] = [barEnd, barStart];
            barLen = -barLen;
        }
        if (barEnd <= 0 || barStart >= 100)
            return;

        if (barStart < farthestEnd) {
            overlapHeightTracker -= 10;
            opacityTracker = 0.7;
            if (barEnd > farthestEnd)
                farthestEnd = barEnd;
        }
        else {
            opacityTracker = 1;
            overlapHeightTracker = 80;
            farthestEnd = barEnd;
        }

        var graphShadow = graphDiv.data().shadow;
        var rowHeight = graphDiv.data().rowHeight;
        var border = graphDiv.data().border;
        var cornerRadius = graphDiv.data().cornerRadius;
        var onmouseover = graphDiv.data().onmouseover;
        var onmouseleave = graphDiv.data().onmouseleave;
        var barColor = rowDiv.data().barColor;
        if (barData[b].barColor != null)
            barColor = barData[b].barColor;

        var barString = '<div id="'+ barData[b].id +'" class="timelineRow eventRect"';
        if (onmouseover != null) {
            barString += ' onmouseover="'+ onmouseover +'(\'' + graphID + '\',\'' + rowID + '\',\'' + barData[b].id +'\')"';
        }
        if (onmouseleave != null) {
            barString += ' onmouseleave="'+ onmouseleave +'(\'' + graphID + '\',\'' + rowID + '\',\'' + barData[b].id +'\')"';
            //barString += ' onmouseleave="'+ onmouseleave +'()"';
        }
        // style
        barString += ' style="opacity: '+ opacityTracker +';top: 10%; height: ' + overlapHeightTracker + '%; width: '+ barLen +'%; margin: 0 '+ barStart +'%; background-color: '+ barColor +';';
        //barString += ' style="height:80%; width: '+ barLen +'%; margin: 0 '+ barStart +'%; background-color: '+ barColor +';';
        /* if (graphShadow === true) {
            barString += ' box-shadow: 1px 1px;';                // limited to 1px shadow for now
            barString += ' height: ';
            if (rowHeight.includes('px'))
                barString += (parseInt(rowHeight, 10)-1) + 'px;';
            else if (rowHeight.includes('%'))
                barString += "100%;"
        } */
        if (border != null) {
            barString += ' border: '+ border +';';
        }
        if (cornerRadius != null) {
            barString += ' border-radius: ' + cornerRadius + ';';
        }

        barString += '">';
        barString += '</div>';
        //console.log(barString);
        rowDiv.append(barString);

        // Store bar data in bar.data
        var barDiv = $('#' + barData[b].id);
        barDiv.data(barData[b]);
    }
}

function mouseOverCallback(graphID, rowID, barID)
{
    var infoPane = $('#infoPane');
    infoPane.html("over: " + graphID + ", " + rowID + ", " + barID);

    if ($('#'+barID).data().title != null)
        infoPane.append( '<br>'+$('#'+barID).data().title );

    //console.log("over: " + graphID , rowID , barID);
}

function mouseLeaveCallback(graphID, rowID, barID)
{
    var infoPane = $('#infoPane');
    infoPane.html("");
    //infoPane.html("leave: " + graphID , rowID , barID);
    //console.log("leave: " + graphID , rowID , barID);
}

$(document).ready(function(){
    console.log("Ready");

    $('#subPage').load('pages/subpage1.html');

    var graphStructure =
    {
        title: "Some Graph",
        showTitle: true,
        rowHeight: "25px",
        border: "1px solid black",
        cornerRadius: "2px",
        //shadow: true,
        onmouseover: "mouseOverCallback",
        onmouseleave: "mouseLeaveCallback",
        rowStruct: [
            {id:"row1", title: "row title", rowColor:"#aaaaaa", barColor:"#3d3"},
            {id:"row2", barColor:"#33d"},
            {id:"row3", barColor:"#dd3"},
            {id:"row4", barColor:"#d33"},
            {id:"row5", barColor:"#3ad"},
            {id:"row6", barColor:"#33F"},
            {id:"row7", barColor:"#dd3"},
            {id:"row8", rowColor:"#555555", barColor:"#d33"},
        ]
    };

    buildTimelineGraph( 'main', 'mainGraph', graphStructure );

    row1data = [
        { id:"bar0", title:"[BWS02 - Zone 3]", start:5, end:17 },
        { id:"bar1", start:21, end:41 },
        { id:"bar2", start:37, end:65 },
        { id:"bar2", start:55, end:60 },
        { id:"bar3", start:90, end:93 },
    ];
    row2data = [
        { id:"2bar0", start:10, end:20, barColor:"#ff00ff", },
        { id:"2bar1", start:30, end:35 },
        { id:"2bar2", start:50, end:70 },
        { id:"2bar3", start:80, end:93 },
    ];
    row3data = [
        { id:"3bar0", start:5, end:95 },
    ];
    row4data = [
        { id:"4bar0", start:5, end:30 },
        { id:"4bar1", start:17, end:40, barColor:"#000000" },
    ];
    row5data = [
        { id:"5bar0", start:60, end:103 },
    ];

    addTimelineBars('mainGraph', 'row1', row1data);
    addTimelineBars('mainGraph', 'row2', row2data);
    addTimelineBars('mainGraph', 'row3', row3data);
    addTimelineBars('mainGraph', 'row4', row4data);
    addTimelineBars('mainGraph', 'row5', row5data);

    console.log("Done");
});