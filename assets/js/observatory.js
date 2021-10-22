class Star {
  constructor(starCoords, index) {
    this.posX = Number.parseInt(starCoords[0]);
    this.posY = Number.parseInt(starCoords[1]) * -1;
    this.realY = Number.parseInt(starCoords[1]);
    this.iType = Number.parseInt(starCoords[2]) + 1;
    this.iIndex = index;
  }
}

class Constellation {
  constructor(constellationID, constellationStars, constellationLines) {

    this.constellationID = constellationID;
    this.constellationStars = constellationStars;
    this.constellationLines = constellationLines;
  }
}

class Line {
  constructor(x, y) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = undefined;
    this.y2 = undefined;
  }
}

class Telescope {

  constructor() {
    this.tooltip = $("#tooltip");
    this.telescope_container = $("#telescope-container");
    this.stars = $("#stars");
    this.tooltip_X = $("#x-coords");
    this.tooltip_Y = $("#y-coords");
    this.tooltip_X_debug = $("#x-coords-debug");
    this.tooltip_Y_debug = $("#y-coords-debug");
    this.button_area = $("#button-area");
    this.button_image = $("#button-image")
    this.scroll_container = $("#scroll-container")
    this.menu_options = $("#options-list li");
    this.current_coords_text = $("#current-coords-text");
    this.submit_arm_container = $("#submit-popup-container");
    this.submit_arm_panel = $("#submit-popup-panel");
    this.scroll_popup_container = $("#scroll-popup-container");
    this.scroll_popup_text = $(".scroll-popup-text");
    this.scroll_popup_text_bottom = $(".scroll-popup-text-bottom");

    this.aConstMap = [];
    this.aStarMap = [];

    this.STAR_POSX = 0;
    this.STAR_POSY = 1;
    this.SELECT_STAR = 0;
    this.SELECT_LINE = 1;
    this.SELECT_DELETE = 2;
    this.SELECT_NONE = 10;
    this.ST_PLAY = 0;
    this.ST_MENU = 1;
    this.ST_WAIT = 2;
    this.ST_WAIT2 = 3;
    this.ST_DONE = 10;

    this.ERROR_SELECTED_STAR_UNDEFINED = "The selected star is undefined.";
    this.ERROR_MAX_STARS_SELECTED = "Can't select more stars.";
    this.ERROR_WRONG_CONSTELLATION = "The selected stars do not match any constellations.";
    this.ERROR_GET_STAR_DATA = "Could not get star data.";

    this.selection_tool_classes = ["select_star", "select_line", "select_delete"]

    this.star_color = ["", "", "white-sm", "yellow", "blue", "red", "purple", "white", "white", "white", "white"]

    this.arm_audio = new Audio('./assets/sounds/2_arm.mp3');
    this.select_audio = new Audio('./assets/sounds/3_select.mp3');
    this.hit_audio = new Audio('./assets/sounds/4_hit.mp3');

    this.overlays = 
    [
      {
        filename: 'jelly.png',
        id: 0,
        offset_x: 0,
        offset_y: 0
      }, {
        filename: 'sleeper.png',
        id: 1,
        offset_x: 2,
        offset_y: -44
      },
      {
        filename: 'dreamer.png',
        id: 2,
        offset_x: -15,
        offset_y: -59
      },
      {
        filename: 'rise.png',
        id: 3,
        offset_x: -39,
        offset_y: -95
      },
      {
        filename: 'farmer.png',
        id: 4,
        offset_x: -10,
        offset_y: -79
      },
      {
        filename: 'dancer.png',
        id: 5,
        offset_x: -40,
        offset_y: -42
      },
      {
        filename: 'wave.png',
        id: 6,
        offset_x: -9,
        offset_y: -76
      },
      {
        filename: 'gladiator.png',
        id: 7,
        offset_x: -5,
        offset_y: -38
      },
      {
        filename: 'collector.png',
        id: 8,
        offset_x: -20,
        offset_y: -19
      },
      {
        filename: 'thief.png',
        id: 9,
        offset_x: -8,
        offset_y: -18
      },
      {
        filename: 'gatherer.png',
        id: 10,
        offset_x: -15,
        offset_y: -175
      },
      {
        filename: 'protector.png',
        id: 11,
        offset_x: 0,
        offset_y: -40
      },
      {
        filename: 'hunter.png',
        id: 12,
        offset_x: -13,
        offset_y: -10
      }
    ];

    this.debug = true;
    this.inside_lens = false;
    this.drawing_line = false;
    this.on_scroll_container = false;

    this.current_state = undefined;
    this.selection_tool = undefined;
    this.last_tool = undefined;
    this.start_star = undefined;
    this.end_star = undefined;
    this.active_line = undefined;
    this.scroll_popup_text_state = "checking";

    // Mouse coords in #stars, from (0,0) to (2500,2500)
    this.mouse_x = 1000;
    this.mouse_y = 1000;

    // Crosshair coords in #stars, from (0,0) to (2500,2500)
    // Turn to negative to get margins of the #stars div
    // Can get center of crosshair with this.prettifyCoords(this.center_x,this.center_y)
    this.center_x = 1250; // margin-left
    this.center_y = 1250; // margin-top

    this.max_stars = 6;
    this.selected_stars = [];
    this.selected_lines = [];
    this.constellationsSolved = [];

    this.setSelectionTool(this.SELECT_STAR);
    this.setCurrentState(this.ST_PLAY);

    this.addEventListeners();

    if (this.debug) {
      this.addDebugEventListeners();
    }
  }

  addEventListeners() {
    // Maybe add event listeners here

    // Keep track if mouse inside the telescope circumference
    this.telescope_container.on('mousemove', (e) => {
      var x = e.pageX - this.telescope_container.offset().left;
      var y = e.pageY - this.telescope_container.offset().top;
      var radius = 413 / 2;
      var center_point = { x: 250, y: 250 };
      var distance = Math.sqrt(Math.pow((center_point.x - x), 2) + Math.pow((center_point.y - y), 2));
      this.inside_lens = distance <= radius;
    });

    // When moving mouse on the #stars div 
    // check if inside the telescope and keep updating mouse coords
    this.stars.on('mousemove', (e) => {
      if (this.inside_lens) {
        this.updateMouseCoords(e);
      }
    });

    // When clicking on the #stars div check if inside the telescope
    // if inside then move and update coords
    this.stars.on('click', (e) => {
      if (this.inside_lens) {
        this.hit_audio.play();
        this.updateCenter(e);
        this.updateMouseCoords(e);
      }
    });

    // Menu options sounds and cursor change
    this.menu_options.on('click', (e) => {
      this.hit_audio.play();
      if (e.target.id == "option-add") {
        this.setSelectionTool(this.SELECT_STAR);
      } else if (e.target.id == "option-connect") {
        this.setSelectionTool(this.SELECT_LINE);
      } else if (e.target.id == "option-delete") {
        this.setSelectionTool(this.SELECT_DELETE);
      }
    });

    // When entering the red button area show button pressed
    // also show scroll container which will show the top and bottom scroll images
    this.button_area.on('mouseover', (e) => {
      // Button Pressed
      $("#button-image").attr("src", "./assets/img/full_button_pressed.png");

      // Show Scroll
      $("#scroll-container").show();
    });

    // When leaving the red button area show button unpressed
    // also hide scroll container which will hide the scroll images
    // unless our mouse left the red button area and entered the scroll area
    this.button_area.on('mouseout', (e) => {
      if (!this.on_scroll_container) {
        // Button Released
        this.button_image.attr("src", "./assets/img/full_button.png");
        // Hide Scroll
        this.scroll_container.hide();
      }
    });

    // When entering the scroll area show button pressed
    // also show scroll container which will show the top, middle and bottom scroll images
    this.scroll_container.on('mouseover', (e) => {
      // Button Pressed
      this.button_image.attr("src", "./assets/img/full_button_pressed.png");
      // Show Scroll
      this.scroll_container.show();
      this.on_scroll_container = true;
    });

    // When entering the scroll area show button pressed
    // also hide scroll container which will hide the top, middle and bottom scroll images
    // if leaving to red button area then that even listener will show them again since this.on_scroll_container is false
    this.scroll_container.on('mouseout', (e) => {
      // Button Release
      this.button_image.attr("src", "./assets/img/full_button.png");
      // Hide Scroll
      this.scroll_container.hide();
      this.on_scroll_container = false;
    });

    this.submit_arm_panel.on('click', (e) => {
      this.toggleSubmitPanel(false);
      this.submitStarData();
    });

    this.scroll_popup_text_bottom.on('click', (e) => {
      console.log("Continue");
      this.toggleScrollPopup(false);
    });

    // When pressing specific keys do stuff
    $(document).on('keydown', (e) => {
      // Number 1 == Add Star (finger)
      if (e.keyCode == 49) {
        this.setSelectionTool(this.SELECT_STAR);
      }
      // Number 2 == Add Line (pen)
      if (e.keyCode == 50) {
        this.setSelectionTool(this.SELECT_LINE);
      }
      // Number 3 == Delete Star (Eraser)
      if (e.keyCode == 51) {
        this.setSelectionTool(this.SELECT_DELETE);
      }
      // Number 4 == Delete all
      if (e.keyCode == 52) {
        if (confirm("Are you sure you want to delete all!?")) {
          this.selected_stars = [];
          this.selected_lines = [];
          this.updateStarMap();
        }
      }

      if (e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();


        // Left Arrow == move left
        if (e.key == "ArrowLeft") {
          this.mouse_y = this.center_y;
          this.mouse_x = this.center_x - 5;
        }
        // Up Arrow == move up
        if (e.key == "ArrowUp") {
          this.mouse_y = this.center_y - 5;
          this.mouse_x = this.center_x;
        }
        // Right Arrow == move right
        if (e.key == "ArrowRight") {
          this.mouse_y = this.center_y;
          this.mouse_x = this.center_x + 5;
        }
        // Down Arrow == move down
        if (e.key == "ArrowDown") {
          this.mouse_y = this.center_y + 5;
          this.mouse_x = this.center_x;
        }

        this.updateCenter(e);
      }
    });
  }

  addDebugEventListeners() {
    this.stars.on('mousemove', (e) => {
      if (this.inside_lens) {
        this.showTooltip(e);
        this.updateTooltipCoords(e);
        this.moveTooltip(e);
      } else {
        this.hideTooltip(e);
      }
    });

    this.stars.on('click', (e) => {
      if (this.inside_lens) {
        this.updateTooltipCoords(e);
      }
    });
  }

  showTooltip(e) {
    this.tooltip.css("display", "block");
  }

  hideTooltip(e) {
    this.tooltip.css("display", "none");
  }

  moveTooltip(e) {
    var left = 0;
    var top = 0;

    if (e.pageX + this.tooltip.width() + 10 < document.body.clientWidth) {
      left = e.pageX + 10;
    } else {
      left = document.body.clientWidth + 5 - this.tooltip.width();
    }

    if (e.pageY + this.tooltip.height() + 10 < document.body.clientHeight) {
      top = e.pageY + 10;
    } else {
      top = document.body.clientHeight + 5 - this.tooltip.height();
    }

    this.tooltip.offset({ top: top, left: left });
  }

  updateTooltipCoords(e) {
    // Coordinates coordinates to show on screen
    // starting from the top right corner of the stars div as (-1250,1250)
    // because the max we can center our telescope crosshair is (-1000,1000) on the top right corner
    /*
          (-1000,1000)         |              (1000,1000)
                               |
                       (-,+)   |   (+,+)
                               |
          -------------------(0,0)-----------------------
                               |
                       (-,-)   |   (+,-)
                               |
          (-1000,1000)         |              (1000,-1000)
    */

    var [shown_x_coords, shown_y_coords] = this.prettifyCoords(this.mouse_x, this.mouse_y);

    this.tooltip_X.text(Number.parseInt(shown_x_coords));
    this.tooltip_Y.text(Number.parseInt(shown_y_coords));
    this.tooltip_X_debug.text(this.mouse_x);
    this.tooltip_Y_debug.text(this.mouse_y);
  }

  updateMouseCoords(e) {
    // Coordinates starting from the top left corner of the stars div as (0,0)
    this.mouse_x = e.pageX - this.stars.offset().left;
    this.mouse_y = e.pageY - this.stars.offset().top;
  }

  updateCenter(e) {
    console.log("Stars clicked moving");
    var new_center_x = this.mouse_x;
    var new_center_y = this.mouse_y;

    //if (!(this.nTeleState != this.ST_PLAY && this.nTeleState != this.ST_DONE)) {

    // Click on the left 250 margin which translates to an x coord under -1000
    if (this.mouse_x < 250) {
      // Force to 250 on the div or -1000 on the telescope
      new_center_x = 250;
    }
    // Click on the right 250 margin which translates to an x coord over 1000
    else if (this.mouse_x > 2250) {
      // Force to 2000 on the div or 1000 on the telescope
      new_center_x = 2250;
    }

    // Click on the top 250 margin which translates to an y coord over 1000
    if (this.mouse_y < 250) {
      // Force to 250 on the div or 1000 on the telescope
      new_center_y = 250;
    }
    // Click on the bottom 250 margin which translates to an y coord under -1000
    else if (this.mouse_y > 2250) {
      // Force to 2000 on the div or -1000 on the telescope
      new_center_y = 2250;
    }

    // We need to put the coords clicked on the center of the telescope
    // Number.parseInt() just in case there's any floating comma
    this.center_x = Number.parseInt(new_center_x);
    this.center_y = Number.parseInt(new_center_y);

    console.log(new_center_x, new_center_y)

    this.moveToCenter();
  }

  moveToCenter() {
    this.stars.css("margin-left", -Math.abs(this.center_x - 250));
    this.stars.css("margin-top", -Math.abs(this.center_y - 250));

    this.updateCurrentCoords();
  }

  // Translate coords from div to shown
  // div coords go from (0,0) to (2500,2500)
  // shown coords go from (-1000,-1000) to (1000,1000)
  prettifyCoords(ugly_x, ugly_y) {
    var pretty_x = ugly_x - (this.stars.width() / 2);
    var pretty_y = (this.stars.height() / 2) - ugly_y;

    return [pretty_x, pretty_y];
  }

  // Translate coords from shown to div
  // shown coords go from (-1000,-1000) to (1000,1000)
  // div coords go from (0,0) to (2500,2500)
  uglifyCoords(pretty_x, pretty_y) {
    var ugly_x = pretty_x + (this.stars.width() / 2);
    var ugly_y = (this.stars.height() / 2) - pretty_y;
    return [ugly_x, ugly_y];
  }

  updateCurrentCoords() {
    var [shown_x_coords, shown_y_coords] = this.prettifyCoords(this.center_x, this.center_y);
    this.current_coords_text.text(`${shown_x_coords},${shown_y_coords}`);
  }

  getStarData() {
    // Make sure aStarMap and aConstMap are empty to fill with updated data
    this.aConstMap = [];
    this.aStarMap = [];
    
    if (location.href.indexOf("neopets2.com") != -1) {
      this.getStarDataTest();
      return;
    }
    var queryString = new URLSearchParams({ get_star_data: 1 });
    fetch("/altador/astro.phtml?" + queryString, {
        "method": "GET",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      })
      .then(response => response.text() )
      .then(data => {
        this.star_data = data;
        var char = this.star_data.charCodeAt(this.star_data.length - 1);
        if (char == 10 || char == 13) {
          this.star_data = this.star_data.substr(0, this.star_data.length - 1);
        }
        var [starDataStars, starDataConstellations] = this.star_data.split(":");
        starDataStars = starDataStars.split("|");
        starDataConstellations = starDataConstellations.split("|");
        if (starDataConstellations[0] == "") {
          starDataConstellations = [];
        }

        // Build Constellation Map array
        for (var i = 0; i < starDataConstellations.length; i++) {
          console.log(starDataConstellations);
          console.log(starDataConstellations[i]);
          var [constellationID, constellationStarsCoords] = starDataConstellations[i].split("!");
          var constellationID = Number.parseInt(constellationID);
          var constellationStarsCoords = constellationStarsCoords.split("#");
          var constellationStars = [];
          var constellationLines = [];
          var j = 0;
          for (var j = 0; j < constellationStarsCoords.length; j++) {
            if (constellationStarsCoords[j].indexOf(";", 0) > 0) {
              // Stars with lines
              var [starCoords1, starCoords2] = constellationStarsCoords[j].split(";");
              var starCoords1 = starCoords1.split(",");
              var starCoords2 = starCoords2.split(",");
              var line = new Line(Number.parseInt(starCoords1[0]), Number.parseInt(starCoords1[1]));
              line.x2 = Number.parseInt(starCoords2[0]);
              line.y2 = Number.parseInt(starCoords2[1]);
              constellationLines.push(line);
              var bFound1 = false;
              var bFound2 = false;

              for (var k = 0; k < constellationStars.length; k++) {
                if (constellationStars[k][0] == line.x1 && constellationStars[k][1] == line.y1) {
                  bFound1 = true;
                } else if (constellationStars[k][0] == line.x2 && constellationStars[k][1] == line.y2) {
                  bFound2 = true;
                }
              }
              if (!bFound1) {
                constellationStars.push([line.x1, line.y1]);
              }
              if (!bFound2) {
                constellationStars.push([line.x2, line.y2]);
              }
            } else {
              // Lonely star
              var starCoords = constellationStarsCoords[j].split(",");
              constellationStars.push([Number.parseInt(starCoords[0]), Number.parseInt(starCoords[1])]);
            }
          }
          var constellation = new Constellation(constellationID, constellationStars, constellationLines);
          this.aConstMap.push(constellation);
        }

        // Build Star Map array
        for (var i = 0; i < starDataStars.length; i++) {
          if (starDataStars[i].length > 0) {
            var aStar = starDataStars[i].split(",");
            this.aStarMap.push(new Star(aStar, i + 1));
          }
        }
        return true;
      })
      .then(bool => this.drawStars())
      .then(bool => this.drawConstellations())
      .catch(error => {
        // handle the error
        console.log(error);
      })
  }

  submitStarData() {
    var result = this.getResult();
    var queryString = new URLSearchParams({ star_submit: result });
    
    this.scroll_popup_text_state = "checking";
    this.toggleScrollPopup(true);

    fetch("/altador/astro.phtml?"+queryString, {
        "method": "GET",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      })
      .then(response => response.text())
      .then(data => {
        if (data == 0) {
          // No constellation found
          this.scroll_popup_text_state = "error";
        } else {
          // Constellation found
          this.scroll_popup_text_state = "success";
          // Clear selected stars/lines
          this.selected_stars = [];
          this.selected_lines = [];
          // Update shown map
          this.getStarData();
        }
        return;
      })
      .finally(_ => {
        this.toggleScrollPopup(true);
      })
  }

  getStarDataTest() {
    this.star_data = "-1,179,1|-1001,81,2|-1002,-471,1|-1004,532,1|-1006,416,2|-1007,-1130,3|-1013,-486,3|-1014,-744,1|-1015,46,1|-1025,-1215,1|-1030,672,1|-1035,803,1|-1036,-765,2|-1037,-829,1|-104,-108,6|-104,666,4|-1042,303,1|-1044,-1066,1|-1047,108,1|-1048,1108,2|-1049,-1050,1|-105,752,1|-1052,-1206,2|-1057,189,2|-1059,-687,1|-106,646,2|-1060,18,1|-1061,-293,2|-1061,322,1|-1062,996,1|-1066,-107,3|-1067,-589,2|-1068,-848,1|-1069,-906,3|-1070,-472,5|-1072,-1050,3|-1073,-213,1|-1074,56,1|-1077,524,2|-1078,-45,4|-1079,205,1|-1081,-196,4|-1081,-812,3|-1082,362,1|-1084,-842,5|-1086,-1097,2|-1091,23,1|-1097,1197,1|-110,-671,3|-1105,763,1|-1108,463,4|-1109,-203,1|-1111,358,6|-1111,60,4|-1112,-183,2|-1112,-540,6|-1112,-879,2|-1113,1029,1|-1114,-780,2|-1120,-39,5|-1123,958,5|-1125,-396,1|-1127,305,1|-1130,974,1|-1133,-184,1|-1133,-994,5|-1134,-1036,1|-1136,-1150,2|-1137,1224,1|-1138,453,1|-1139,75,1|-1142,-832,3|-1142,125,1|-1143,879,1|-1149,-301,1|-115,-1147,6|-1153,810,1|-1154,474,1|-1160,-1117,1|-1162,423,2|-1165,-250,1|-1166,-428,1|-1168,541,1|-117,-1237,1|-117,-544,1|-117,-994,2|-1170,-383,1|-1177,1197,1|-1179,-367,1|-118,196,3|-1181,-137,1|-1181,-740,2|-1185,-458,1|-1193,13,1|-1193,397,2|-1196,-625,1|-12,1116,1|-120,-18,1|-120,-824,2|-120,1123,2|-1202,-546,6|-1203,-88,6|-1207,-978,3|-1209,-396,4|-1209,-929,6|-1210,-163,2|-1212,-898,1|-1218,1077,2|-122,-302,1|-122,-445,2|-122,169,1|-1221,1247,2|-1221,367,1|-1222,-415,1|-1223,-466,2|-1229,-1054,1|-1230,-254,1|-1230,118,2|-1232,1122,2|-1234,179,2|-1236,-948,2|-1236,597,2|-1242,-790,1|-1246,-59,1|-125,-104,3|-125,867,1|-1250,-1250,1|-1250,1250,1|-126,-649,1|-129,382,1|-13,-104,3|-13,491,1|-13,726,4|-131,1238,1|-143,-201,2|-144,-949,1|-146,987,1|-149,-555,1|-15,-138,1|-15,817,1|-150,-174,1|-151,-1086,1|-153,-122,1|-153,-138,2|-153,1148,1|-154,932,2|-159,818,2|-160,-1222,3|-161,-69,1|-162,371,2|-163,1180,1|-164,-886,2|-165,-394,1|-166,724,2|-166,963,1|-168,684,1|-17,-1134,1|-173,759,6|-177,-48,3|-178,634,1|-180,-350,1|-180,-816,2|-181,406,1|-182,491,1|-185,-582,4|-185,780,1|-19,393,3|-19,635,2|-193,-1019,1|-193,-413,2|-200,-156,3|-200,100,4|-201,-177,1|-202,696,1|-204,-1044,2|-207,-287,5|-208,1078,1|-209,-1110,2|-211,810,1|-214,145,2|-215,-30,2|-218,-1143,1|-220,40,1|-222,1055,3|-224,-154,1|-23,1027,1|-231,379,1|-236,-998,4|-247,-143,2|-248,949,1|-250,806,5|-255,-599,2|-260,-678,1|-261,-707,1|-263,152,1|-265,634,1|-268,482,3|-268,554,2|-268,694,1|-27,-266,3|-271,-272,3|-278,-135,1|-28,140,1|-280,-1074,4|-280,180,1|-280,20,3|-284,-383,1|-286,46,1|-291,-169,1|-291,-727,1|-294,915,1|-299,-822,1|-299,313,2|-301,-897,3|-303,-1006,2|-304,-343,2|-306,439,1|-308,591,2|-309,288,3|-311,395,1|-312,24,3|-313,-304,4|-317,-271,1|-318,500,6|-32,46,1|-320,1190,2|-321,-1133,2|-321,-198,1|-321,484,1|-324,-373,1|-326,247,2|-33,-1032,1|-331,599,1|-332,-3,1|-334,-280,4|-335,-226,1|-335,809,1|-338,-826,6|-338,185,1|-34,-246,2|-340,-886,3|-340,160,2|-341,-767,2|-346,-161,3|-347,-55,4|-349,-810,5|-352,-1110,2|-354,-1132,1|-354,116,6|-356,-389,3|-358,634,2|-36,-399,1|-360,100,1|-360,652,1|-364,-253,1|-365,-1205,1|-368,-12,1|-368,684,2|-369,-352,3|-37,218,1|-377,985,5|-378,582,1|-379,1211,1|-379,652,1|-382,-815,2|-384,-1104,4|-388,61,2|-390,432,1|-396,-1085,3|-396,1248,2|-40,-1109,2|-40,773,3|-40,984,3|-400,-156,1|-401,762,1|-407,218,2|-409,-61,2|-416,348,1|-418,-21,6|-419,379,2|-431,919,2|-434,-393,1|-438,1117,2|-439,-1186,1|-44,921,3|-441,-1042,2|-442,1081,4|-443,-258,4|-444,-313,3|-445,965,1|-446,-330,6|-446,893,4|-451,-847,2|-451,481,3|-456,-466,1|-458,-913,2|-461,-707,1|-462,-967,1|-462,1208,1|-463,409,3|-464,-625,3|-467,235,6|-467,557,1|-468,39,1|-469,-337,4|-469,-445,2|-469,917,1|-471,-1125,2|-471,19,2|-472,297,1|-479,-773,2|-480,-658,2|-480,-902,1|-482,-1043,1|-487,1173,1|-488,-116,5|-489,-261,6|-489,201,1|-489,334,1|-49,59,1|-491,981,3|-493,-1091,1|-495,-822,1|-50,-714,1|-502,1185,1|-503,297,1|-503,76,1|-506,-778,1|-508,686,2|-511,40,4|-512,235,3|-515,-729,1|-516,994,1|-519,1223,2|-521,-617,1|-523,-458,1|-529,859,6|-53,-815,1|-530,-749,2|-533,405,3|-536,1157,1|-538,344,1|-54,493,1|-541,797,1|-544,667,1|-546,-264,1|-548,-1098,4|-55,533,1|-55,837,1|-552,-1137,2|-553,-361,1|-56,-623,1|-56,1185,1|-564,1083,1|-569,447,2|-573,75,1|-575,-661,1|-575,-734,3|-575,701,3|-577,-782,2|-577,422,1|-580,975,1|-581,734,1|-584,-624,3|-584,-904,2|-584,686,2|-587,-574,3|-589,-310,2|-59,-1126,1|-592,937,1|-594,-489,1|-596,734,1|-598,1012,2|-599,-512,1|-60,229,5|-60,369,6|-605,71,6|-607,883,2|-608,274,2|-608,344,2|-608,414,2|-612,-982,2|-614,314,2|-622,1194,1|-625,573,6|-626,780,1|-630,-362,5|-633,420,1|-637,821,2|-638,955,2|-639,-1218,1|-640,-439,1|-640,200,2|-641,-6,3|-642,-416,1|-642,15,3|-645,1143,1|-646,-79,1|-655,-582,6|-655,-702,1|-655,500,1|-66,-296,1|-661,-19,2|-667,939,2|-670,178,3|-675,-662,1|-675,1130,2|-675,53,1|-678,1079,1|-678,344,1|-680,-901,1|-680,447,4|-682,609,2|-684,-1103,1|-684,976,1|-686,-989,3|-688,1030,1|-688,36,2|-689,-414,1|-690,933,3|-691,-1175,1|-693,-50,1|-695,-622,5|-699,-669,2|-700,-526,2|-703,246,2|-704,683,3|-706,-726,4|-706,567,2|-708,47,2|-71,-275,1|-710,120,2|-712,859,1|-713,10,2|-713,586,2|-718,1032,6|-719,31,4|-721,-507,2|-722,101,2|-722,433,1|-728,-446,3|-728,-753,1|-730,-838,4|-731,384,1|-736,523,3|-738,434,3|-745,-632,2|-748,-362,2|-75,-46,2|-75,16,3|-750,-448,3|-753,895,3|-754,-1112,1|-755,-1195,1|-755,-502,3|-756,421,1|-761,-533,2|-764,-876,2|-766,-171,1|-766,1074,1|-768,-1087,4|-768,-150,6|-768,1148,1|-77,-105,1|-770,783,4|-775,-135,2|-78,352,4|-780,1224,3|-783,1102,1|-784,-865,6|-791,257,2|-792,-1056,6|-792,-375,2|-792,121,1|-793,84,1|-797,-243,1|-8,-613,1|-800,463,1|-800,951,2|-801,205,2|-804,-123,1|-806,1184,1|-812,-1173,6|-818,582,1|-819,-786,2|-820,38,2|-823,875,1|-824,-1154,1|-824,543,1|-83,-1098,1|-830,-356,3|-832,-907,1|-834,15,3|-836,-739,1|-837,-270,1|-838,656,1|-84,-733,2|-841,-566,3|-842,-1048,1|-842,466,1|-846,559,2|-85,261,3|-854,1032,1|-859,-647,1|-861,2,2|-863,27,1|-869,-483,1|-873,-1033,1|-88,-343,3|-88,198,1|-883,765,1|-884,-487,1|-888,-404,2|-891,66,2|-892,-689,3|-899,884,1|-901,-789,1|-903,-639,2|-903,1102,1|-904,-1202,2|-907,-846,1|-907,551,1|-911,-1118,3|-912,-817,2|-912,-9,1|-913,653,1|-917,722,1|-918,-1168,4|-921,1167,3|-924,-304,1|-925,-656,1|-926,866,1|-927,-30,2|-928,-1201,1|-928,892,6|-929,202,1|-930,-755,5|-931,1011,1|-934,-90,4|-939,-1231,1|-939,572,1|-94,574,1|-941,-13,2|-942,-526,2|-943,-739,1|-944,-1136,1|-946,-955,1|-946,717,4|-949,972,2|-95,687,3|-956,1000,1|-957,-1237,3|-96,-153,1|-963,354,1|-964,-574,5|-967,-183,1|-967,1026,6|-968,1244,2|-969,-758,1|-974,-168,4|-975,223,4|-976,655,1|-977,459,1|-978,-716,1|-979,-984,1|-982,-677,1|-983,-1136,1|-990,-1010,1|-990,-165,1|-990,438,3|-992,-313,3|-992,676,2|-994,-1104,2|-994,-638,1|-994,961,4|0,199,1|0,399,1|0,5,1|1,-1247,1|1,334,6|10,1144,1|1003,662,1|1004,424,3|1007,-199,1|1007,544,2|101,-637,2|1012,-1236,1|1014,-865,1|1014,989,1|1015,-410,1|1021,277,1|1023,-286,1|1026,293,1|1026,75,3|1032,422,1|1036,369,1|1037,-406,1|1039,800,1|104,-243,3|104,-378,1|1043,1152,1|1051,1052,1|1051,402,1|1051,665,2|1053,515,1|1057,834,1|1064,724,1|1066,-538,1|1067,-465,3|1067,-728,1|1067,945,2|1068,1132,1|1070,-832,2|1074,198,1|1078,-907,1|1079,-124,1|1080,-1223,1|1080,-790,3|1081,-1048,2|1084,738,1|1088,1100,1|1096,574,2|1099,-374,2|1102,-147,1|1111,284,2|1115,-1005,1|1117,-792,1|112,1124,1|1121,1153,2|1122,1089,3|1123,-1231,4|1129,-875,3|113,-782,1|1133,297,1|1139,237,2|114,-38,4|1140,-176,1|1140,-826,1|1145,-1051,1|1145,680,1|1154,-436,4|1154,-715,2|1155,-610,1|116,-1027,1|1167,1242,1|1167,946,1|117,-949,1|1170,-68,1|1176,-851,3|1179,-1226,2|1182,396,2|1185,-227,1|1185,860,1|1191,-873,2|1191,509,4|1195,1013,1|1198,251,1|1211,-149,2|1212,-508,1|1212,1172,2|1213,-702,4|1213,577,5|1216,1141,2|1217,-1046,3|1219,-261,1|1221,-337,6|1225,-306,3|123,-441,3|123,406,2|1230,-600,5|1230,469,1|1233,-118,4|1237,974,1|124,199,1|124,801,6|1242,-814,3|1243,784,1|1245,-146,3|1245,-992,3|1245,268,5|1246,452,1|1247,-553,1|1249,-1055,1|125,-203,2|1250,-1250,1|1250,1250,1|126,646,1|127,1162,1|133,136,1|134,-329,1|14,466,2|14,779,2|143,-422,1|145,-675,1|149,-596,5|15,-1197,2|15,1175,1|153,-1083,2|154,1179,3|16,1235,1|162,126,1|163,-220,4|165,-203,3|165,-563,3|169,1017,3|17,-28,1|170,339,3|172,-288,4|173,-372,1|178,1206,3|178,796,4|184,-423,3|185,-1186,1|185,-576,2|187,911,1|188,309,1|188,81,4|189,104,1|19,-740,1|19,695,5|191,637,1|193,-502,2|195,247,4|197,-1028,3|203,-412,2|205,-173,1|205,410,3|206,-224,1|208,-533,3|21,-391,1|213,-908,4|214,-729,1|214,1104,1|216,-625,1|217,180,4|229,-956,2|23,193,2|230,319,4|236,528,2|241,970,2|245,-143,1|245,1171,1|245,483,2|245,620,1|253,-721,1|254,-670,6|255,-1247,1|257,-803,1|257,1131,1|266,-819,1|266,3,2|266,589,3|267,-466,4|268,727,1|27,1211,3|27,794,1|271,777,2|271,831,2|273,-710,2|275,-12,2|276,1150,1|277,-1044,1|280,249,3|281,363,1|288,922,1|29,0,1|290,339,1|291,420,1|293,-173,1|293,972,2|294,-546,3|3,-412,3|300,379,4|301,275,1|305,-890,6|305,1187,1|31,40,1|315,-390,4|315,719,2|318,432,2|32,437,3|320,-844,1|320,797,2|326,116,1|328,-597,6|331,136,1|336,-663,5|346,435,1|349,-1103,5|35,-706,5|352,-1001,3|355,1029,2|356,-408,1|359,-943,1|360,399,6|361,-834,1|364,-328,1|367,-140,1|378,-161,1|381,1003,2|382,-530,1|385,-294,1|39,-1226,2|393,-689,3|396,-1223,1|396,42,1|402,-598,3|402,623,1|405,267,4|408,1165,6|410,-755,1|411,-417,2|412,1104,5|413,-1141,1|415,-786,1|418,-281,1|419,1009,2|424,-141,5|428,98,3|429,-1246,1|430,-682,6|432,763,2|435,742,1|436,-720,3|436,-842,6|436,435,2|441,-113,1|441,-565,1|442,563,2|443,-942,3|444,811,3|447,1174,1|448,-131,1|448,-301,1|45,-143,2|457,1077,2|458,210,1|459,-999,2|463,647,3|464,538,2|471,-946,2|472,-924,1|472,693,1|474,299,1|478,-281,3|479,-757,3|484,1091,1|484,880,1|485,79,2|486,1212,4|486,139,1|487,-409,1|488,-906,2|489,216,1|490,1049,3|491,-1063,1|498,-1096,1|499,1122,1|502,-373,1|505,756,2|509,112,1|509,1215,2|51,722,1|512,-210,1|512,-493,1|512,808,2|513,439,1|516,-396,3|518,-161,4|520,40,3|529,-707,1|529,187,6|53,-342,1|534,247,1|537,381,1|54,-294,1|541,904,1|542,593,4|544,-602,1|547,-353,2|548,-534,2|548,836,5|550,-271,1|551,-1204,2|552,673,1|554,-153,3|555,-876,1|557,-1053,4|557,-1101,1|56,265,4|561,606,1|566,-206,1|572,1046,1|573,203,3|573,402,4|578,-866,2|58,817,1|581,-885,4|585,492,3|590,1046,2|591,979,2|598,295,4|599,-264,1|60,-477,1|60,229,1|60,369,2|600,384,1|602,165,2|605,-581,1|608,215,2|609,-1138,2|612,653,3|615,-1208,2|62,-119,1|621,-1165,1|622,515,1|63,-155,1|63,-669,3|63,-720,1|63,1057,1|630,-227,4|630,-362,1|630,711,2|635,550,2|640,-777,1|644,-81,1|644,87,6|646,510,1|648,223,2|649,-670,2|65,-1131,1|654,864,1|656,-1233,2|66,551,1|661,1194,4|661,187,1|662,-963,1|666,993,2|671,1218,1|678,944,2|685,438,1|687,-722,3|689,467,3|693,-973,1|696,-8,2|697,484,1|70,324,3|703,-884,2|705,-412,1|713,-203,1|714,-836,1|717,-153,1|717,-307,5|718,-345,1|72,1026,3|722,921,1|723,-24,2|723,-786,1|723,1154,2|724,-979,2|73,-923,2|733,1072,2|738,753,6|74,-640,1|746,-15,1|746,-204,3|746,208,6|746,729,1|749,-352,1|753,-719,6|754,-1031,1|755,-1063,2|756,525,1|758,880,2|761,1178,5|766,-879,5|769,-1114,3|770,-1159,5|771,1036,1|78,188,2|781,-550,3|785,-452,3|785,153,1|790,-1058,1|792,-918,2|795,445,1|795,870,1|796,1147,1|798,-475,2|799,-1224,3|799,492,2|80,-791,1|802,962,1|804,757,2|808,740,1|811,267,6|812,-160,2|818,-711,1|819,-852,3|819,1223,5|82,-532,1|827,-1129,2|83,-4,1|831,-422,1|832,-873,4|836,-459,3|84,772,2|840,319,3|840,435,1|841,-520,1|842,-145,2|842,844,1|843,-200,1|843,-601,1|844,-1191,3|844,-900,1|85,-173,1|853,460,1|853,919,3|857,204,1|859,781,3|86,-682,2|861,-1038,2|861,750,3|867,-257,4|87,-391,1|872,818,1|874,-448,2|875,-608,3|884,-813,2|884,724,1|885,-877,1|888,533,1|889,-243,2|89,593,2|892,-991,2|892,1153,1|892,770,1|893,-1029,2|893,-319,1|896,-1155,1|9,-468,1|9,1104,1|9,35,3|90,-811,1|900,-601,2|902,-510,1|910,-841,2|916,-940,1|916,1195,1|917,-21,1|919,220,1|921,-91,2|923,-1049,1|924,-791,1|924,340,2|928,-1225,1|93,125,1|931,-921,1|931,178,5|937,1002,5|938,52,1|939,808,1|94,1067,2|940,-691,1|941,1031,1|944,-486,3|944,-971,2|945,7,6|947,-1083,2|948,389,1|949,-14,1|951,-833,1|96,81,3|960,-303,2|961,-1155,1|964,-236,1|964,-989,6|964,454,1|968,900,3|970,-342,1|970,-59,1|971,-486,1|971,-566,1|977,-669,2|977,160,1|978,-1076,1|978,975,1|979,578,1|99,854,1|991,306,2|996,-233,1|996,-466,3|999,-1009,2:1!45,-143;85,-173#85,-173;125,-203#165,-203;205,-173#205,-173;245,-143|2!170,339;230,319#230,319;290,339#290,339;300,379#300,379;360,399#280,249|3!-360,100;-340,160#-340,160;-280,180#-200,100;-220,40#-220,40;-280,20|4!-444,-313;-304,-343#-434,-393;-324,-373#-304,-343;-284,-383#-364,-253;-304,-343#-324,-373;-284,-383|5!-60,229;0,199#0,199;60,229#-60,369;0,399#0,399;60,369|6!3,-412;53,-342#53,-342;173,-372#173,-372;203,-412#203,-412;193,-502#193,-502;143,-422|7!378,-161;418,-281#418,-281;448,-301#448,-301;478,-281#478,-281;518,-161#518,-161;448,-131#448,-131;378,-161|8!-368,684;-358,634#-368,684;-268,694#-268,554;-268,694#-268,694;-168,684#-178,634;-168,684|9!-755,-502;-745,-632#-745,-632;-695,-622#-695,-622;-675,-662#-675,-662;-655,-702#-695,-622;-655,-582#-755,-502;-655,-582|10!402,623;442,563#402,623;552,673#442,563;542,593#542,593;552,673#432,763;472,693|11!-738,434#-678,344;-608,274#-678,344;-608,344#-678,344;-608,414#-608,344;-608,274#-608,344;-608,414#-608,344;-538,344#-608,274;-538,344#-608,414;-538,344";
    this.star_data = "-1,179,1|-1001,81,2|-1002,-471,1|-1004,532,1|-1006,416,2|-1007,-1130,3|-1013,-486,3|-1014,-744,1|-1015,46,1|-1025,-1215,1|-1030,672,1|-1035,803,1|-1036,-765,2|-1037,-829,1|-104,-108,6|-104,666,4|-1042,303,1|-1044,-1066,1|-1047,108,1|-1048,1108,2|-1049,-1050,1|-105,752,1|-1052,-1206,2|-1057,189,2|-1059,-687,1|-106,646,2|-1060,18,1|-1061,-293,2|-1061,322,1|-1062,996,1|-1066,-107,3|-1067,-589,2|-1068,-848,1|-1069,-906,3|-1070,-472,5|-1072,-1050,3|-1073,-213,1|-1074,56,1|-1077,524,2|-1078,-45,4|-1079,205,1|-1081,-196,4|-1081,-812,3|-1082,362,1|-1084,-842,5|-1086,-1097,2|-1091,23,1|-1097,1197,1|-110,-671,3|-1105,763,1|-1108,463,4|-1109,-203,1|-1111,358,6|-1111,60,4|-1112,-183,2|-1112,-540,6|-1112,-879,2|-1113,1029,1|-1114,-780,2|-1120,-39,5|-1123,958,5|-1125,-396,1|-1127,305,1|-1130,974,1|-1133,-184,1|-1133,-994,5|-1134,-1036,1|-1136,-1150,2|-1137,1224,1|-1138,453,1|-1139,75,1|-1142,-832,3|-1142,125,1|-1143,879,1|-1149,-301,1|-115,-1147,6|-1153,810,1|-1154,474,1|-1160,-1117,1|-1162,423,2|-1165,-250,1|-1166,-428,1|-1168,541,1|-117,-1237,1|-117,-544,1|-117,-994,2|-1170,-383,1|-1177,1197,1|-1179,-367,1|-118,196,3|-1181,-137,1|-1181,-740,2|-1185,-458,1|-1193,13,1|-1193,397,2|-1196,-625,1|-12,1116,1|-120,-18,1|-120,-824,2|-120,1123,2|-1202,-546,6|-1203,-88,6|-1207,-978,3|-1209,-396,4|-1209,-929,6|-1210,-163,2|-1212,-898,1|-1218,1077,2|-122,-302,1|-122,-445,2|-122,169,1|-1221,1247,2|-1221,367,1|-1222,-415,1|-1223,-466,2|-1229,-1054,1|-1230,-254,1|-1230,118,2|-1232,1122,2|-1234,179,2|-1236,-948,2|-1236,597,2|-1242,-790,1|-1246,-59,1|-125,-104,3|-125,867,1|-1250,-1250,1|-1250,1250,1|-126,-649,1|-129,382,1|-13,-104,3|-13,491,1|-13,726,4|-131,1238,1|-143,-201,2|-144,-949,1|-146,987,1|-149,-555,1|-15,-138,1|-15,817,1|-150,-174,1|-151,-1086,1|-153,-122,1|-153,-138,2|-153,1148,1|-154,932,2|-159,818,2|-160,-1222,3|-161,-69,1|-162,371,2|-163,1180,1|-164,-886,2|-165,-394,1|-166,724,2|-166,963,1|-168,684,1|-17,-1134,1|-173,759,6|-177,-48,3|-178,634,1|-180,-350,1|-180,-816,2|-181,406,1|-182,491,1|-185,-582,4|-185,780,1|-19,393,3|-19,635,2|-193,-1019,1|-193,-413,2|-200,-156,3|-200,100,4|-201,-177,1|-202,696,1|-204,-1044,2|-207,-287,5|-208,1078,1|-209,-1110,2|-211,810,1|-214,145,2|-215,-30,2|-218,-1143,1|-220,40,1|-222,1055,3|-224,-154,1|-23,1027,1|-231,379,1|-236,-998,4|-247,-143,2|-248,949,1|-250,806,5|-255,-599,2|-260,-678,1|-261,-707,1|-263,152,1|-265,634,1|-268,482,3|-268,554,2|-268,694,1|-27,-266,3|-271,-272,3|-278,-135,1|-28,140,1|-280,-1074,4|-280,180,1|-280,20,3|-284,-383,1|-286,46,1|-291,-169,1|-291,-727,1|-294,915,1|-299,-822,1|-299,313,2|-301,-897,3|-303,-1006,2|-304,-343,2|-306,439,1|-308,591,2|-309,288,3|-311,395,1|-312,24,3|-313,-304,4|-317,-271,1|-318,500,6|-32,46,1|-320,1190,2|-321,-1133,2|-321,-198,1|-321,484,1|-324,-373,1|-326,247,2|-33,-1032,1|-331,599,1|-332,-3,1|-334,-280,4|-335,-226,1|-335,809,1|-338,-826,6|-338,185,1|-34,-246,2|-340,-886,3|-340,160,2|-341,-767,2|-346,-161,3|-347,-55,4|-349,-810,5|-352,-1110,2|-354,-1132,1|-354,116,6|-356,-389,3|-358,634,2|-36,-399,1|-360,100,1|-360,652,1|-364,-253,1|-365,-1205,1|-368,-12,1|-368,684,2|-369,-352,3|-37,218,1|-377,985,5|-378,582,1|-379,1211,1|-379,652,1|-382,-815,2|-384,-1104,4|-388,61,2|-390,432,1|-396,-1085,3|-396,1248,2|-40,-1109,2|-40,773,3|-40,984,3|-400,-156,1|-401,762,1|-407,218,2|-409,-61,2|-416,348,1|-418,-21,6|-419,379,2|-431,919,2|-434,-393,1|-438,1117,2|-439,-1186,1|-44,921,3|-441,-1042,2|-442,1081,4|-443,-258,4|-444,-313,3|-445,965,1|-446,-330,6|-446,893,4|-451,-847,2|-451,481,3|-456,-466,1|-458,-913,2|-461,-707,1|-462,-967,1|-462,1208,1|-463,409,3|-464,-625,3|-467,235,6|-467,557,1|-468,39,1|-469,-337,4|-469,-445,2|-469,917,1|-471,-1125,2|-471,19,2|-472,297,1|-479,-773,2|-480,-658,2|-480,-902,1|-482,-1043,1|-487,1173,1|-488,-116,5|-489,-261,6|-489,201,1|-489,334,1|-49,59,1|-491,981,3|-493,-1091,1|-495,-822,1|-50,-714,1|-502,1185,1|-503,297,1|-503,76,1|-506,-778,1|-508,686,2|-511,40,4|-512,235,3|-515,-729,1|-516,994,1|-519,1223,2|-521,-617,1|-523,-458,1|-529,859,6|-53,-815,1|-530,-749,2|-533,405,3|-536,1157,1|-538,344,1|-54,493,1|-541,797,1|-544,667,1|-546,-264,1|-548,-1098,4|-55,533,1|-55,837,1|-552,-1137,2|-553,-361,1|-56,-623,1|-56,1185,1|-564,1083,1|-569,447,2|-573,75,1|-575,-661,1|-575,-734,3|-575,701,3|-577,-782,2|-577,422,1|-580,975,1|-581,734,1|-584,-624,3|-584,-904,2|-584,686,2|-587,-574,3|-589,-310,2|-59,-1126,1|-592,937,1|-594,-489,1|-596,734,1|-598,1012,2|-599,-512,1|-60,229,5|-60,369,6|-605,71,6|-607,883,2|-608,274,2|-608,344,2|-608,414,2|-612,-982,2|-614,314,2|-622,1194,1|-625,573,6|-626,780,1|-630,-362,5|-633,420,1|-637,821,2|-638,955,2|-639,-1218,1|-640,-439,1|-640,200,2|-641,-6,3|-642,-416,1|-642,15,3|-645,1143,1|-646,-79,1|-655,-582,6|-655,-702,1|-655,500,1|-66,-296,1|-661,-19,2|-667,939,2|-670,178,3|-675,-662,1|-675,1130,2|-675,53,1|-678,1079,1|-678,344,1|-680,-901,1|-680,447,4|-682,609,2|-684,-1103,1|-684,976,1|-686,-989,3|-688,1030,1|-688,36,2|-689,-414,1|-690,933,3|-691,-1175,1|-693,-50,1|-695,-622,5|-699,-669,2|-700,-526,2|-703,246,2|-704,683,3|-706,-726,4|-706,567,2|-708,47,2|-71,-275,1|-710,120,2|-712,859,1|-713,10,2|-713,586,2|-718,1032,6|-719,31,4|-721,-507,2|-722,101,2|-722,433,1|-728,-446,3|-728,-753,1|-730,-838,4|-731,384,1|-736,523,3|-738,434,3|-745,-632,2|-748,-362,2|-75,-46,2|-75,16,3|-750,-448,3|-753,895,3|-754,-1112,1|-755,-1195,1|-755,-502,3|-756,421,1|-761,-533,2|-764,-876,2|-766,-171,1|-766,1074,1|-768,-1087,4|-768,-150,6|-768,1148,1|-77,-105,1|-770,783,4|-775,-135,2|-78,352,4|-780,1224,3|-783,1102,1|-784,-865,6|-791,257,2|-792,-1056,6|-792,-375,2|-792,121,1|-793,84,1|-797,-243,1|-8,-613,1|-800,463,1|-800,951,2|-801,205,2|-804,-123,1|-806,1184,1|-812,-1173,6|-818,582,1|-819,-786,2|-820,38,2|-823,875,1|-824,-1154,1|-824,543,1|-83,-1098,1|-830,-356,3|-832,-907,1|-834,15,3|-836,-739,1|-837,-270,1|-838,656,1|-84,-733,2|-841,-566,3|-842,-1048,1|-842,466,1|-846,559,2|-85,261,3|-854,1032,1|-859,-647,1|-861,2,2|-863,27,1|-869,-483,1|-873,-1033,1|-88,-343,3|-88,198,1|-883,765,1|-884,-487,1|-888,-404,2|-891,66,2|-892,-689,3|-899,884,1|-901,-789,1|-903,-639,2|-903,1102,1|-904,-1202,2|-907,-846,1|-907,551,1|-911,-1118,3|-912,-817,2|-912,-9,1|-913,653,1|-917,722,1|-918,-1168,4|-921,1167,3|-924,-304,1|-925,-656,1|-926,866,1|-927,-30,2|-928,-1201,1|-928,892,6|-929,202,1|-930,-755,5|-931,1011,1|-934,-90,4|-939,-1231,1|-939,572,1|-94,574,1|-941,-13,2|-942,-526,2|-943,-739,1|-944,-1136,1|-946,-955,1|-946,717,4|-949,972,2|-95,687,3|-956,1000,1|-957,-1237,3|-96,-153,1|-963,354,1|-964,-574,5|-967,-183,1|-967,1026,6|-968,1244,2|-969,-758,1|-974,-168,4|-975,223,4|-976,655,1|-977,459,1|-978,-716,1|-979,-984,1|-982,-677,1|-983,-1136,1|-990,-1010,1|-990,-165,1|-990,438,3|-992,-313,3|-992,676,2|-994,-1104,2|-994,-638,1|-994,961,4|0,199,1|0,399,1|0,5,1|1,-1247,1|1,334,6|10,1144,1|1003,662,1|1004,424,3|1007,-199,1|1007,544,2|101,-637,2|1012,-1236,1|1014,-865,1|1014,989,1|1015,-410,1|1021,277,1|1023,-286,1|1026,293,1|1026,75,3|1032,422,1|1036,369,1|1037,-406,1|1039,800,1|104,-243,3|104,-378,1|1043,1152,1|1051,1052,1|1051,402,1|1051,665,2|1053,515,1|1057,834,1|1064,724,1|1066,-538,1|1067,-465,3|1067,-728,1|1067,945,2|1068,1132,1|1070,-832,2|1074,198,1|1078,-907,1|1079,-124,1|1080,-1223,1|1080,-790,3|1081,-1048,2|1084,738,1|1088,1100,1|1096,574,2|1099,-374,2|1102,-147,1|1111,284,2|1115,-1005,1|1117,-792,1|112,1124,1|1121,1153,2|1122,1089,3|1123,-1231,4|1129,-875,3|113,-782,1|1133,297,1|1139,237,2|114,-38,4|1140,-176,1|1140,-826,1|1145,-1051,1|1145,680,1|1154,-436,4|1154,-715,2|1155,-610,1|116,-1027,1|1167,1242,1|1167,946,1|117,-949,1|1170,-68,1|1176,-851,3|1179,-1226,2|1182,396,2|1185,-227,1|1185,860,1|1191,-873,2|1191,509,4|1195,1013,1|1198,251,1|1211,-149,2|1212,-508,1|1212,1172,2|1213,-702,4|1213,577,5|1216,1141,2|1217,-1046,3|1219,-261,1|1221,-337,6|1225,-306,3|123,-441,3|123,406,2|1230,-600,5|1230,469,1|1233,-118,4|1237,974,1|124,199,1|124,801,6|1242,-814,3|1243,784,1|1245,-146,3|1245,-992,3|1245,268,5|1246,452,1|1247,-553,1|1249,-1055,1|125,-203,2|1250,-1250,1|1250,1250,1|126,646,1|127,1162,1|133,136,1|134,-329,1|14,466,2|14,779,2|143,-422,1|145,-675,1|149,-596,5|15,-1197,2|15,1175,1|153,-1083,2|154,1179,3|16,1235,1|162,126,1|163,-220,4|165,-203,3|165,-563,3|169,1017,3|17,-28,1|170,339,3|172,-288,4|173,-372,1|178,1206,3|178,796,4|184,-423,3|185,-1186,1|185,-576,2|187,911,1|188,309,1|188,81,4|189,104,1|19,-740,1|19,695,5|191,637,1|193,-502,2|195,247,4|197,-1028,3|203,-412,2|205,-173,1|205,410,3|206,-224,1|208,-533,3|21,-391,1|213,-908,4|214,-729,1|214,1104,1|216,-625,1|217,180,4|229,-956,2|23,193,2|230,319,4|236,528,2|241,970,2|245,-143,1|245,1171,1|245,483,2|245,620,1|253,-721,1|254,-670,6|255,-1247,1|257,-803,1|257,1131,1|266,-819,1|266,3,2|266,589,3|267,-466,4|268,727,1|27,1211,3|27,794,1|271,777,2|271,831,2|273,-710,2|275,-12,2|276,1150,1|277,-1044,1|280,249,3|281,363,1|288,922,1|29,0,1|290,339,1|291,420,1|293,-173,1|293,972,2|294,-546,3|3,-412,3|300,379,4|301,275,1|305,-890,6|305,1187,1|31,40,1|315,-390,4|315,719,2|318,432,2|32,437,3|320,-844,1|320,797,2|326,116,1|328,-597,6|331,136,1|336,-663,5|346,435,1|349,-1103,5|35,-706,5|352,-1001,3|355,1029,2|356,-408,1|359,-943,1|360,399,6|361,-834,1|364,-328,1|367,-140,1|378,-161,1|381,1003,2|382,-530,1|385,-294,1|39,-1226,2|393,-689,3|396,-1223,1|396,42,1|402,-598,3|402,623,1|405,267,4|408,1165,6|410,-755,1|411,-417,2|412,1104,5|413,-1141,1|415,-786,1|418,-281,1|419,1009,2|424,-141,5|428,98,3|429,-1246,1|430,-682,6|432,763,2|435,742,1|436,-720,3|436,-842,6|436,435,2|441,-113,1|441,-565,1|442,563,2|443,-942,3|444,811,3|447,1174,1|448,-131,1|448,-301,1|45,-143,2|457,1077,2|458,210,1|459,-999,2|463,647,3|464,538,2|471,-946,2|472,-924,1|472,693,1|474,299,1|478,-281,3|479,-757,3|484,1091,1|484,880,1|485,79,2|486,1212,4|486,139,1|487,-409,1|488,-906,2|489,216,1|490,1049,3|491,-1063,1|498,-1096,1|499,1122,1|502,-373,1|505,756,2|509,112,1|509,1215,2|51,722,1|512,-210,1|512,-493,1|512,808,2|513,439,1|516,-396,3|518,-161,4|520,40,3|529,-707,1|529,187,6|53,-342,1|534,247,1|537,381,1|54,-294,1|541,904,1|542,593,4|544,-602,1|547,-353,2|548,-534,2|548,836,5|550,-271,1|551,-1204,2|552,673,1|554,-153,3|555,-876,1|557,-1053,4|557,-1101,1|56,265,4|561,606,1|566,-206,1|572,1046,1|573,203,3|573,402,4|578,-866,2|58,817,1|581,-885,4|585,492,3|590,1046,2|591,979,2|598,295,4|599,-264,1|60,-477,1|60,229,1|60,369,2|600,384,1|602,165,2|605,-581,1|608,215,2|609,-1138,2|612,653,3|615,-1208,2|62,-119,1|621,-1165,1|622,515,1|63,-155,1|63,-669,3|63,-720,1|63,1057,1|630,-227,4|630,-362,1|630,711,2|635,550,2|640,-777,1|644,-81,1|644,87,6|646,510,1|648,223,2|649,-670,2|65,-1131,1|654,864,1|656,-1233,2|66,551,1|661,1194,4|661,187,1|662,-963,1|666,993,2|671,1218,1|678,944,2|685,438,1|687,-722,3|689,467,3|693,-973,1|696,-8,2|697,484,1|70,324,3|703,-884,2|705,-412,1|713,-203,1|714,-836,1|717,-153,1|717,-307,5|718,-345,1|72,1026,3|722,921,1|723,-24,2|723,-786,1|723,1154,2|724,-979,2|73,-923,2|733,1072,2|738,753,6|74,-640,1|746,-15,1|746,-204,3|746,208,6|746,729,1|749,-352,1|753,-719,6|754,-1031,1|755,-1063,2|756,525,1|758,880,2|761,1178,5|766,-879,5|769,-1114,3|770,-1159,5|771,1036,1|78,188,2|781,-550,3|785,-452,3|785,153,1|790,-1058,1|792,-918,2|795,445,1|795,870,1|796,1147,1|798,-475,2|799,-1224,3|799,492,2|80,-791,1|802,962,1|804,757,2|808,740,1|811,267,6|812,-160,2|818,-711,1|819,-852,3|819,1223,5|82,-532,1|827,-1129,2|83,-4,1|831,-422,1|832,-873,4|836,-459,3|84,772,2|840,319,3|840,435,1|841,-520,1|842,-145,2|842,844,1|843,-200,1|843,-601,1|844,-1191,3|844,-900,1|85,-173,1|853,460,1|853,919,3|857,204,1|859,781,3|86,-682,2|861,-1038,2|861,750,3|867,-257,4|87,-391,1|872,818,1|874,-448,2|875,-608,3|884,-813,2|884,724,1|885,-877,1|888,533,1|889,-243,2|89,593,2|892,-991,2|892,1153,1|892,770,1|893,-1029,2|893,-319,1|896,-1155,1|9,-468,1|9,1104,1|9,35,3|90,-811,1|900,-601,2|902,-510,1|910,-841,2|916,-940,1|916,1195,1|917,-21,1|919,220,1|921,-91,2|923,-1049,1|924,-791,1|924,340,2|928,-1225,1|93,125,1|931,-921,1|931,178,5|937,1002,5|938,52,1|939,808,1|94,1067,2|940,-691,1|941,1031,1|944,-486,3|944,-971,2|945,7,6|947,-1083,2|948,389,1|949,-14,1|951,-833,1|96,81,3|960,-303,2|961,-1155,1|964,-236,1|964,-989,6|964,454,1|968,900,3|970,-342,1|970,-59,1|971,-486,1|971,-566,1|977,-669,2|977,160,1|978,-1076,1|978,975,1|979,578,1|99,854,1|991,306,2|996,-233,1|996,-466,3|999,-1009,2:1!45,-143;85,-173#85,-173;125,-203#165,-203;205,-173#205,-173;245,-143|2!170,339;230,319#230,319;290,339#290,339;300,379#300,379;360,399#280,249|3!-360,100;-340,160#-340,160;-280,180#-200,100;-220,40#-220,40;-280,20|4!-444,-313;-304,-343#-434,-393;-324,-373#-304,-343;-284,-383#-364,-253;-304,-343#-324,-373;-284,-383|5!-60,229;0,199#0,199;60,229#-60,369;0,399#0,399;60,369|6!3,-412;53,-342#53,-342;173,-372#173,-372;203,-412#203,-412;193,-502#193,-502;143,-422|7!378,-161;418,-281#418,-281;448,-301#448,-301;478,-281#478,-281;518,-161#518,-161;448,-131#448,-131;378,-161|8!-368,684;-358,634#-368,684;-268,694#-268,554;-268,694#-268,694;-168,684#-178,634;-168,684|9!-755,-502;-745,-632#-745,-632;-695,-622#-695,-622;-675,-662#-675,-662;-655,-702#-695,-622;-655,-582#-755,-502;-655,-582|10!402,623;442,563#402,623;552,673#442,563;542,593#542,593;552,673#432,763;472,693|11!-738,434#-678,344;-608,274#-678,344;-608,344#-678,344;-608,414#-608,344;-608,274#-608,344;-608,414#-608,344;-538,344#-608,274;-538,344#-608,414;-538,344|12!-461,-707;-451,-847#-461,-707;-291,-727#-451,-847;-301,-897#-301,-897;-291,-727#-451,-847;-341,-767#-341,-767;-291,-727#-291,-727;-261,-707";
    var char = this.star_data.charCodeAt(this.star_data.length - 1);
    if (char == 10 || char == 13) {
      this.star_data = this.star_data.substr(0, this.star_data.length - 1);
    }
    var [starDataStars, starDataConstellations] = this.star_data.split(":");
    starDataStars = starDataStars.split("|");
    starDataConstellations = starDataConstellations.split("|");

    // Build Constellation Map array
    for (var i = 0; i < starDataConstellations.length; i++) {
      var [constellationID, constellationStarsCoords] = starDataConstellations[i].split("!");
      var constellationID = Number.parseInt(constellationID);
      var constellationStarsCoords = constellationStarsCoords.split("#");

      var constellationStars = [];
      var constellationLines = [];

      for (var j = 0; j < constellationStarsCoords.length; j++) {
        if (constellationStarsCoords[j].indexOf(";", 0) > 0) {
          // Stars with lines
          var [starCoords1, starCoords2] = constellationStarsCoords[j].split(";");
          var starCoords1 = starCoords1.split(",");
          var starCoords2 = starCoords2.split(",");
          var line = new Line(Number.parseInt(starCoords1[0]), Number.parseInt(starCoords1[1]));
          line.x2 = Number.parseInt(starCoords2[0]);
          line.y2 = Number.parseInt(starCoords2[1]);
          constellationLines.push(line);
          var bFound1 = false;
          var bFound2 = false;

          for (var k = 0; k < constellationStars.length; k++) {
            if (constellationStars[k][0] == line.x1 && constellationStars[k][1] == line.y1) {
              bFound1 = true;
            } else if (constellationStars[k][0] == line.x2 && constellationStars[k][1] == line.y2) {
              bFound2 = true;
            }
          }
          if (!bFound1) {
            constellationStars.push([line.x1, line.y1]);
          }
          if (!bFound2) {
            constellationStars.push([line.x2, line.y2]);
          }
        } else {
          // Lonely star
          var starCoords = constellationStarsCoords[j].split(",");
          constellationStars.push([Number.parseInt(starCoords[0]), Number.parseInt(starCoords[1])]);
        }
      }
      var constellation = new Constellation(constellationID, constellationStars, constellationLines);
      this.aConstMap.push(constellation);
    }

    var aStar = [];
    // Build Star Map array
    for (var i = 0; i < starDataStars.length; i++) {
      if (starDataStars[i].length > 0) {
        var aStar = starDataStars[i].split(",");
        this.aStarMap.push(new Star(aStar, i + 1));
      }
    }
    this.drawStars();
    this.drawConstellations();
  }

  drawStars() {
    console.log("Drawing Stars");
    for (var i = 0; i < this.aStarMap.length; i++) {
      var curr_star = this.aStarMap[i];

      var star_overlay_wrapper = document.createElement("div");
      var star = document.createElement("div");
      var overlay = document.createElement("div");
      var selected_overlay = document.createElement("div");

      var star_div_x_coords = (this.stars.width() / 2) + curr_star.posX
      var star_div_y_coords = (this.stars.height() / 2) + curr_star.posY

      $(star).addClass('star');
      $(star).addClass(this.star_color[curr_star.iType]);
      $(star).attr('x_pos', curr_star.posX);
      $(star).attr('y_pos', curr_star.realY);
      $(star).attr('type', curr_star.iType);
      $(star).css("left", star_div_x_coords);
      $(star).css("top", star_div_y_coords);

      $(overlay).addClass('overlay');
      $(overlay).css("left", star_div_x_coords);
      $(overlay).css("top", star_div_y_coords);
      $(overlay).append(`<span>${curr_star.posX},${curr_star.realY}</span>`);

      $(selected_overlay).addClass('small-overlay');
      $(selected_overlay).css("left", star_div_x_coords);
      $(selected_overlay).css("top", star_div_y_coords);

      $(star_overlay_wrapper).append(star);
      $(star_overlay_wrapper).append(overlay);
      $(star_overlay_wrapper).append(selected_overlay);

      this.stars.append(star_overlay_wrapper);
    }

    // Once Stars ar drawn attack event listener
    // $(".star").on("click", this.starClicked);  (If attached like here, inside starClicked() `this.` means the element clicked.)
    $(".star").on("click", (e) => {
      this.starClicked(e);
    });

    return true;
  }

  starClicked(e) {
    // Stop propagating the event so we don't move the background when selecting stars
    e.stopPropagation();
    if (this.current_state == this.ST_PLAY) {
      if (this.selection_tool == this.SELECT_STAR) {
        var added = this.addStar(e.target);
      } else if (this.selection_tool == this.SELECT_LINE) {
        if (!this.drawing_line) {
          // When drawing a line (i.e. attached to the mouse)
          // this line is not added to this.selected_lines
          // when clicking the last star the temporary line
          // is deleted and a new one is drawn fixed in place
          // and added to this.selected_lines

          this.start_star = e.target;
          var added = this.addStar(this.start_star);
          if (!added) {
            return;
          }

          // Start Line Drawing
          // Add .line div
          var line = document.createElement("div");
          $(line).addClass('line');
          $(line).addClass('active');

          this.active_line = line;

          var line_left = Number.parseInt($(this.start_star).css('left').slice(0, -2));
          var line_top = Number.parseInt($(this.start_star).css('top').slice(0, -2));

          $(this.active_line).css("left", line_left);
          $(this.active_line).css("top", line_top);

          this.drawing_line = true;
          this.stars.append(this.active_line);
          this.stars.on("mousemove.drawing_line", (e) => {
            this.stick_line_to_mouse(e);
          });
          this.stars.on("mousedown.drawing_line", (e) => {
            this.cancel_line(e);
          });
          this.stars.on("keydown.drawing_line", (e) => {
            this.cancel_line(e);
          });
        } else {
          // End Line Drawing
          // Connect the 2 stars
          this.end_star = e.target;
          var added = this.addLine(this.start_star, this.end_star);
          if (added) {
            this.endLinkMode();
            this.start_star = undefined;
            this.end_star = undefined;
          }
        }
      } else if (this.selection_tool == this.SELECT_DELETE) {
        this.deleteStar(e.target);
      }

      // In these selection tools we will need to update the star map
      // SELECT_STAR, SELECT_LINE AND SELECT_DELETE
      if (this.selection_tool >= 0 && this.selection_tool < 3) {
        this.updateStarMap();
      }
    }
  }

  stick_line_to_mouse(e) {

    if (this.active_line == undefined) { return; }
    // first star
    var posax = $(this.active_line).css('left').slice(0, -2);
    var posay = $(this.active_line).css('top').slice(0, -2);

    // last star
    var posbx = e.pageX - this.stars.offset().left;
    var posby = e.pageY - this.stars.offset().top;

    //angle 
    var angle = Math.atan2(posby - posay, posbx - posax) * 180 / Math.PI;

    //distance
    var distance = Math.sqrt(Math.pow((posax - posbx), 2) + Math.pow((posay - posby), 2));

    //bring all the work together
    $(this.active_line).css('width', distance + 'px')
    $(this.active_line).css('transform', 'rotate(' + angle + 'deg)');
  }

  cancel_line(e) {
    if ((e.type == 'mousedown' && e.which == 3) ||
      (e.type == 'keydown' && e.keyCode == 27)
    ) {
      this.endLinkMode();
    }
  }

  endLinkMode() {
    $(this.active_line).remove();
    this.active_line = undefined;
    this.drawing_line = false;
    this.stars.unbind('mousemove.drawing_line').unbind('mousedown.drawing_line').unbind('keydown.drawing_line');
    /*
    // If cancelled with only 1 star selected then delete first selected star from this.selected_stars
    this.deleteStar(this.start_star);
    // If cancelled with only 1 star selected this does nothing.
    this.deleteStar(this.end_star);
    // If this.endLinkMode() called from clicking on end_star both stars will get added to this.selected_stars on this.addLine()
    */
  }

  setSelectionTool(tool) {
    // Remove all previous tool classes
    this.selection_tool_classes.forEach((toolClass) => {
      this.telescope_container.removeClass(toolClass);
    })

    if (tool >= 0 && tool < 3) {
      this.selection_tool = tool;
      var toolClass = this.selection_tool_classes[tool];
      this.telescope_container.addClass(toolClass);
    }
  }

  setCurrentState(state) {
    if ((state >= 0 && state < 3) || state == 10) {
      this.current_state = state;
    }
  }

  addStar(star) {
    if (star == undefined) {
      this.error(this.ERROR_SELECTED_STAR_UNDEFINED);
    }

    var x = $(star).attr("x_pos");
    var y = $(star).attr("y_pos");

    if (!this.starAlreadySelected(x, y)) {
      if (!this.starOnSolvedConstellation(x, y)) {
        if (this.selected_stars.length < this.max_stars) {
          this.selected_stars.push([x, y]);
          this.debug_log("log", "Selected star: ", x, y);
          if (this.selected_stars.length == 6) {
            this.toggleSubmitPanel(true);
          }
          return true;
        } else {
          this.error(this.ERROR_MAX_STARS_SELECTED);
        }
      } else {
        this.error(this.ERROR_SELECTED_CONSTELLATION_STAR);
      }
    } else {
      return true;
    }
    return false;
  }

  deleteStar(star) {
    if (star == undefined) {
      this.error(this.ERROR_SELECTED_STAR_UNDEFINED);
    }

    var x = $(star).attr("x_pos");
    var y = $(star).attr("y_pos");

    if (this.removeStar(x, y) != -1) {
      this.removeLines(x, y);
      // Update html
      //this.updateStarMap();
      if (this.selected_stars.length < 6 && this.submit_arm_container.hasClass("show")) {
        this.toggleSubmitPanel(true);
      }
      return true;
    }
    return false;
  }

  starAlreadySelected(x, y) {
    for (var i = 0; i < this.selected_stars.length; i++) {
      if (this.selected_stars[i][0] == x) {
        if (this.selected_stars[i][1] == y) {
          return true;
        }
      }
    }
    return false;
  }

  starOnSolvedConstellation(x, y) {
    var bExists = false;
    for (var i = 0; i < this.aConstMap.length; i++) {
      var stars = this.aConstMap[i].constellationStars;
      for (var j = 0; j < stars.length; j++) {
        if (stars[j][0] == x) {
          if (stars[j][1] == y) {
            bExists = true;
            i = this.aConstMap.length + 1;
            break;
          }
        }
      }
    }
    return bExists;
  }

  addLine(start_star, end_star) {
    // This adds a line to this.selected_lines based on this.start_star and this.end_star
    var x1 = $(start_star).attr("x_pos");
    var y1 = $(start_star).attr("y_pos");
    var x2 = $(end_star).attr("x_pos");
    var y2 = $(end_star).attr("y_pos");

    var line = new Line(x1, y1);
    line.x2 = x2;
    line.y2 = y2;

    var added = this.addStar(start_star);
    added = added && this.addStar(end_star);
    if (added) {
      this.selected_lines.push(line)
    }

    return added;
  }

  removeStar(x, y) {
    var start = -1;
    for (var i = 0; i < this.selected_stars.length; i++) {
      if (this.selected_stars[i][0] == x) {
        if (this.selected_stars[i][1] == y) {
          start = i;
          break;
        }
      }
    }
    if (start != -1) {
      this.selected_stars.splice(start, 1);
    }
    return start;
  }

  removeLines(x, y) {
    var bSearch = true;

    while (bSearch) {
      var start = -1;
      for (var i = 0; i < this.selected_lines.length; i++) {
        if (this.selected_lines[i].x1 == x || this.selected_lines[i].x2 == x) {
          if (this.selected_lines[i].y1 == y || this.selected_lines[i].y2 == y) {
            start = i;
            break;
          }
        }
      }
      if (start != -1) {
        this.selected_lines.splice(start, 1);
      } else {
        bSearch = false;
      }
    }
  }

  updateStarMap() {
    this.debug_log("log", "================ UPDATING MAP ================");
    this.updateStars();
    this.updateLines();
    this.debug_log("log", "this.selected_stars.length => ", this.selected_stars.length);
    this.debug_log("log", "this.selected_lines.length => ", this.selected_lines.length);
    this.debug_log("log", "================ MAP UPDATED ================");
  }

  updateStars() {
    // Unselect all
    $(".star").not(".solved").removeClass("selected");

    // Select stars in this.selected_stars
    this.selected_stars.forEach(([x, y]) => {
      var star = $(`.star[x_pos=${x}][y_pos=${y}]`);
      star.addClass("selected");
    });

    // Set solved stars
    this.constellationsSolved.forEach((constellation) => {
      console.log(constellation);
    });
  }

  updateLines() {
    // Remove all lines except the one we might be drawing
    // although I don't thing this is possible unless someone is playing with the console
    $(".line").not(".active").not(".solved").remove();


    // Draw lines in this.selected_lines
    for (var i = 0; i < this.selected_lines.length; i++) {
      var line = this.selected_lines[i];

      var start_star = $(`.star[x_pos=${line.x1}][y_pos=${line.y1}]`);
      var end_star = $(`.star[x_pos=${line.x2}][y_pos=${line.y2}]`);

      var line = document.createElement("div");
      $(line).addClass('line');

      // first star
      var posax = start_star.css('left').slice(0, -2);
      var posay = start_star.css('top').slice(0, -2);

      // last star
      var posbx = end_star.css('left').slice(0, -2);
      var posby = end_star.css('top').slice(0, -2);

      //angle 
      var angle = Math.atan2(posby - posay, posbx - posax) * 180 / Math.PI;

      //distance
      var distance = Math.sqrt(Math.pow((posax - posbx), 2) + Math.pow((posay - posby), 2));

      //bring all the work together
      $(line).css('left', posax + 'px');
      $(line).css('top', posay + 'px');
      $(line).css('width', distance + 'px');
      $(line).css('transform', 'rotate(' + angle + 'deg)');

      this.stars.append(line);
    }
  }

  drawConstellations() {
    console.log("Drawing Constellations");
    $(".constellation-overlay").remove();


    // Draw found constellations
    this.aConstMap.forEach(({ constellationID: id, constellationLines: lines, constellationStars: stars }) => {
      console.log("---------------- Drawing constellation nº", id,"----------------");
      console.log(this.overlays[id]);
      // Draw Stars
      stars.forEach(([x, y]) => {
        var star = $(`.star[x_pos=${x}][y_pos=${y}]`);
        star.addClass("solved");

      });

      // Draw Lines
      lines.forEach((line) => {
        var start_star = $(`.star[x_pos=${line.x1}][y_pos=${line.y1}]`);
        var end_star = $(`.star[x_pos=${line.x2}][y_pos=${line.y2}]`);

        var line = document.createElement("div");
        $(line).addClass('line');
        $(line).addClass('solved');

        // first star
        var posax = start_star.css('left').slice(0, -2);
        var posay = start_star.css('top').slice(0, -2);

        // last star
        var posbx = end_star.css('left').slice(0, -2);
        var posby = end_star.css('top').slice(0, -2);

        //angle 
        var angle = Math.atan2(posby - posay, posbx - posax) * 180 / Math.PI;

        //distance
        var distance = Math.sqrt(Math.pow((posax - posbx), 2) + Math.pow((posay - posby), 2));

        //bring all the work together
        $(line).css('left', posax + 'px');
        $(line).css('top', posay + 'px');
        $(line).css('width', distance + 'px');
        $(line).css('transform', 'rotate(' + angle + 'deg)');

        this.stars.append(line);
      })

      // Draw Overlay
      var lowest_x = 999999;
      var lowest_y = -999999;
      stars.forEach(([x, y]) => {
        if (x < lowest_x) {
          lowest_x = x;
          lowest_y = y;
        } else if (x == lowest_x && y > lowest_y) {
          lowest_x = x;
          lowest_y = y;
        }
      });

      var star = $(`.star[x_pos=${lowest_x}][y_pos=${lowest_y}]`);

      console.log("TOPLEFT Star",star);

      if (star == undefined) {
        this.error("Overlay Star NOT FOUND!");
      }

      var overlay_top = Number.parseInt(star.position().top + this.overlays[id].offset_y);
      var overlay_left = Number.parseInt(star.position().left + this.overlays[id].offset_x);

      console.log("TOPLEFT Star css ",star.position());

      var overlay_image = document.createElement("img");
      $(overlay_image).addClass('constellation-overlay');
      $(overlay_image).attr('src', "./assets/img/constellations/" + this.overlays[id].filename);
      $(overlay_image).css('left', overlay_left + "px");
      $(overlay_image).css('top', overlay_top + "px");
      $(overlay_image).insertAfter(star);

      console.log("Overlay image css ",$(overlay_image).position());

    });

    return true;
  }

  toggleSubmitPanel(finished) {
    this.submit_arm_container.toggleClass("show", finished);
    this.arm_audio.play();
  }

  toggleScrollPopup(finished) {
    // Hide or show the scroll popup
    this.scroll_popup_container.toggleClass("show", finished);
    // Hide all possible scroll texts
    this.scroll_popup_text.toggleClass("show",false);
    // Show the correct scroll text
    this.scroll_popup_text.filter("."+this.scroll_popup_text_state).toggleClass("show",true);
  }

  getResult() {
    var result = "";
    this.selected_stars.forEach((starCoords) => {
      var curStar = starCoords[0] + ',' + starCoords[1];
      var foundLine = false;
      this.selected_lines.forEach((lineCoords) => {
        if (lineCoords.x1 == starCoords[0] && lineCoords.y1 == starCoords[1]) {
          foundLine = true;
          result += curStar + ";" + lineCoords.x2 + "," + lineCoords.y2 + "|";
        } else if (lineCoords.x2 == starCoords[0] && lineCoords.y2 == starCoords[1]) {
          foundLine = true;
          result += curStar + ";" + lineCoords.x1 + "," + lineCoords.y1 + "|";
        }
      });
      if (!foundLine) {
        result += curStar + "|";
      }
    });

    if (result.charAt(result.length - 1) == "|") {
      result = result.substr(0, result.length - 1);
    }

    return result;
  }

  debug_log(type, ...strings) {
    if (this.debug) {
      if (type == 'log') {
        console.log(strings.join(" "));
      } else if (type == 'error') {
        console.error(strings.join(" "));
      }
    }
  }

  error(type) {
    this.debug_log("error", type);
    throw type;
  }
}

const telescope = new Telescope();

telescope.getStarData();