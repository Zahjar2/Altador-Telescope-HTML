class Star_old {
  constructor(starCoords, index) {
    this.posX = Number.parseInt(starCoords[0]);
    this.posY = Number.parseInt(starCoords[1]) * -1;
    this.realY = Number.parseInt(starCoords[1]);
    this.iType = Number.parseInt(starCoords[2]) + 1;
    this.iIndex = index;
    this.bVisible = false;
    this.bCreated = false;
    this.mc = undefined;
  }
}

class Constellation_old {
  constructor(constellationID, constellationStars, constellationLines) {

    this.constellationID = constellationID;
    this.constellationStars = constellationStars;
    this.constellationLines = constellationLines;
  }
}

class Line_old {
  constructor(x, y) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = undefined;
    this.y2 = undefined;
  }
}

class ConstellationClip {

  constructor(constClip, const2Clip, aConst) {
    // TODO convert this.mc and this.mc2 to canvas or something
    this.mc = constClip;
    this.mc2 = const2Clip;
    this.aConstSolved = aConst;
    this.aOverlays = [];
    this.aOverlays.push({ mc: "overlay_1", xOffset: 0, yOffset: -45 });
    this.aOverlays.push({ mc: "overlay_2", xOffset: -15, yOffset: -59 });
    this.aOverlays.push({ mc: "overlay_3", xOffset: -39, yOffset: -95 });
    this.aOverlays.push({ mc: "overlay_4", xOffset: -10, yOffset: -79 });
    this.aOverlays.push({ mc: "overlay_5", xOffset: -40, yOffset: -184 });
    this.aOverlays.push({ mc: "overlay_6", xOffset: -9, yOffset: -76 });
    this.aOverlays.push({ mc: "overlay_7", xOffset: -7, yOffset: -39 });
    this.aOverlays.push({ mc: "overlay_8", xOffset: -23, yOffset: -21 });
    this.aOverlays.push({ mc: "overlay_9", xOffset: -10, yOffset: -20 });
    this.aOverlays.push({ mc: "overlay_10", xOffset: -15, yOffset: -175 });
    this.aOverlays.push({ mc: "overlay_11", xOffset: -3, yOffset: -40 });
    this.aOverlays.push({ mc: "overlay_12", xOffset: -13, yOffset: -13 });
    this.numStars = 6;
    this.aStars = [];
    this.aLines = [];
    this.aStarColors = [16711935, 5601279];
    this.aLineColors = [16777215, 255];
  }

  initialize() {
    this.mc2.clear();
    for (var i = 0; i < this.aConstSolved.length; i++) {
      var constellation = this.aConstSolved[i];
      this.redrawStars(1, constellation.aStars, this.mc2);
      this.redrawLines(1, constellation.aLines, this.mc2);
      if (constellation.iInd <= this.aOverlays.length) {
        var i = 999999;
        var y = -999999;
        for (var i = 0; i < constellation.aStars.length; i++) {
          if (constellation.aStars[i][0] < i) {
            i = constellation.aStars[i][0];
            y = constellation.aStars[i][1];
          } else if (constellation.aStars[i][0] == i && constellation.aStars[i][1] > y) {
            i = constellation.aStars[i][0];
            y = constellation.aStars[i][1];
          }
        }
        var objOL = this.aOverlays[constellation.iInd - 1];
        var d = 100 + constellation.iInd;
        if (this.mc2[objOL.mc] == undefined) {
          // TODO convert this flash thing to canvas or something
          this.mc2.attachMovie(objOL.mc, objOL.mc, d, { _x: i + objOL.xOffset, _y: y + objOL.yOffset });
        }
      }
    }
  };

  reset() {
    this.mc.clear();
    this.aStars = [];
    this.aLines = [];
  }

  deleteAll() {
    this.reset();
  };

  showStars() {
    var string = "";
    for (var i = 0; i < this.aStars.length; i++) {
      string += "\nstar " + i + ": " + this.aStars[i][0] + ", " + this.aStars[i][1];
    }
    return string;
  }

  showLines() {
    var string = "";
    for (var i = 0; i < this.aLines.length; i++) {
      string += "\nline " + i + ": " + this.aLines[i].x1 + ", " + this.aLines[i].y1 + " to " + this.aLines[i].x2 + ", " + this.aLines[i].y2;
    }
    return string;
  };

  completed() {
    if (this.aStars.length >= this.numStars) {
      return true;
    }
    return false;
  };

  deleteStar(x, y) {
    if (this.removeStar(x, y) != -1) {
      this.removeLines(x, y);
      this.redrawAll();
      return true;
    }
    return false;
  };

  addStar(x, y) {
    if (!this.starAlreadySelected(x, y)) {
      if (!this.starOnSolvedConstellation(x, y)) {
        if (this.aStars.length < this.numStars) {
          this.aStars.push([x, y]);
          this.redrawAll();
          return true;
        }
      }
    }
    return false;
  };

  addConnection(x, y) {
    if (this.starOnSolvedConstellation(x, y)) {
      return false;
    }
    if (!this.starAlreadySelected(x, y)) {
      if (this.aStars.length >= this.numStars) {
        return false;
      }
      this.aStars.push([x, y]);
    }
    var iLast = this.aLines.length;
    var line = this.aLines[iLast - 1];
    if (iLast <= 0) {
      this.aLines.push(new lineClass(x, y));
      return true;
    } else if (line.x2 != undefined) {
      this.aLines.push(new lineClass(x, y));
      return true;
    } else if (x != line.x1 || y != line.y1) {
      if (!this.lineExists(line.x1, line.y1, x, y)) {
        line.x2 = x;
        line.y2 = y;
        this.redrawAll();
        return true;
      }
    }
    return false;
  };

  updateLines(xm, ym, sx, sy) {
    this.redrawAll();
    var line = this.aLines[this.aLines.length - 1];
    this.mc.lineStyle(1, 16711935, 100);
    this.mc.moveTo(line.x1, line.y1);
    this.mc.lineTo(xm, ym);
  };

  redrawAll() {
    this.mc.clear();
    this.redrawStars(0, this.aStars, this.mc);
    this.redrawLines(0, this.aLines, this.mc);
  };

  redrawStars(iColor, aS, mcDraw) {
    var color = this.aStarColors[iColor];
    mcDraw.lineStyle(0, 0);
    for (var i = 0; i < aS.length; i++) {
      this.drawCircle(aS[i][0], aS[i][1], 10, mcDraw, color);
    }
  };

  redrawLines(iColor, aS, mcDraw) {
    var color = this.aLineColors[iColor];
    mcDraw.lineStyle(1, color, 100);
    for (var i = 0; i < aS.length; i++) {
      if (aS[i].x2 != undefined) {
        mcDraw.moveTo(aS[i].x1, aS[i].y1);
        mcDraw.lineTo(aS[i].x2, aS[i].y2);
      }
    }
    mcDraw.lineStyle();
  };

  getResult() {
    var sRes = "";
    var sFinal = "";
    for (var i = 0; i < this.aStars.length; i++) {
      var starCoords = this.aStars[i];
      var curStar = starCoords[0] + "," + starCoords[1] * -1;
      var bFoundLine = false;
      for (var j = 0; j < this.aLines.length; j++) {
        var lineCoords = this.aLines[j];
        if (lineCoords.x1 == starCoords[0] && lineCoords.y1 == starCoords[1]) {
          bFoundLine = true;
          sRes += curStar + ";" + lineCoords.x2 + "," + lineCoords.y2 * -1 + "|";
        } else if (lineCoords.x2 == starCoords[0] && lineCoords.y2 == starCoords[1]) {
          bFoundLine = true;
          sRes += curStar + ";" + lineCoords.x1 + "," + lineCoords.y1 * -1 + "|";
        }
      }
      if (!bFoundLine) {
        sRes += curStar + "|";
      }
    }
    if (sRes.charAt(sRes.length - 1) == "|") {
      sFinal = sRes.substr(0, sRes.length - 1);
    } else {
      sFinal = sRes;
    }
    return sFinal;
  };

  drawCircle(x, y, r, mcDraw, c) {
    mcDraw.moveTo(x + radius, y);
    mcDraw.lineStyle();
    mcDraw.beginFill(c, 50);
    mcDraw.curveTo(radius + x, 0.41421356237309503 * radius + y, 0.7071067811865475 * radius + x, 0.7071067811865475 * radius + y);
    mcDraw.curveTo(0.41421356237309503 * radius + x, radius + y, x, radius + y);
    mcDraw.curveTo(-0.41421356237309503 * radius + x, radius + y, -0.7071067811865475 * radius + x, 0.7071067811865475 * radius + y);
    mcDraw.curveTo(-radius + x, 0.41421356237309503 * radius + y, -radius + x, y);
    mcDraw.curveTo(-radius + x, -0.41421356237309503 * radius + y, -0.7071067811865475 * radius + x, -0.7071067811865475 * radius + y);
    mcDraw.curveTo(-0.41421356237309503 * radius + x, -radius + y, x, -radius + y);
    mcDraw.curveTo(0.41421356237309503 * radius + x, -radius + y, 0.7071067811865475 * radius + x, -0.7071067811865475 * radius + y);
    mcDraw.curveTo(radius + x, -0.41421356237309503 * radius + y, radius + x, y);
    mcDraw.endFill();
  };

  starAlreadySelected(x, y) {
    for (var i = 0; i < this.aStars.length; i++) {
      if (this.aStars[i][0] == x) {
        if (this.aStars[i][1] == y) {
          return true;
        }
      }
    }
    return false;
  };

  starOnSolvedConstellation(x, y) {
    var bExists = false;
    for (var i = 0; i < this.aConstSolved.length; i++) {
      var stars = this.aConstSolved[i].aStars;
      for (var j = 0; j < stars.length; j++) {
        if (stars[j][0] == x) {
          if (stars[j][1] == y) {
            bExists = true;
            i = this.aConstSolved.length + 1;
            break;
          }
        }
      }
    }
    return bExists;
  };

  removeStar(x, y) {
    var start = -1;
    for (var i = 0; i < this.aStars.length; i++) {
      if (this.aStars[i][0] == x) {
        if (this.aStars[i][1] == y) {
          start = i;
          break;
        }
      }
    }
    if (start != -1) {
      this.aStars.splice(start, 1);
    }
    return start;
  };

  lineExists(x1, y1, x2, y2) {
    var bExists = false;
    for (var i = 0; i < this.aLines.length; i++) {
      var line = this.aLines[i];
      if (line.x1 == x1 && line.x2 == x2 || line.x1 == x2 && line.x2 == x1) {
        if (line.y1 == y1 && line.y2 == y2 || line.y1 == y2 && line.y2 == y1) {
          bExists = true;
          break;
        }
      }
    }
    return bExists;
  };

  removeLines(x, y) {
    var bSearch = true;

    while (bSearch) {
      var start = -1;
      for (var i = 0; i < this.aLines.length; i++) {
        if (this.aLines[i].x1 == x || this.aLines[i].x2 == x) {
          if (this.aLines[i].y1 == y || this.aLines[i].y2 == y) {
            start = i;
            break;
          }
        }
      }
      if (start != -1) {
        this.aLines.splice(start, 1);
      } else {
        bSearch = false;
      }
    }
  };

  removeCurrentLine() {
    this.aLines.splice(this.aLines.length - 1, 1);
    this.redrawAll();
  };
}


class Telescope_old {

  constructor() {
    this.STAR_POSX = 0;
    this.STAR_POSY = 1;
    this.STAR_TYPE = 2;
    this.SELECT_STAR = 0;
    this.SELECT_LINE = 1;
    this.SELECT_DELETE = 2;
    this.SELECT_NONE = 10;
    this.ST_PLAY = 0;
    this.ST_MENU = 1;
    this.ST_WAIT = 2;
    this.ST_WAIT2 = 3;
    this.ST_DONE = 10;
    this.nTeleState = this.ST_PLAY;
    this.starBgW = 500;
    this.starBgH = 500;
    this.screenW = 500;
    this.screenH = 500;
    this.scrW2 = this.screenW / 2;
    this.scrH2 = this.screenH / 2;
    // spaceX and spaceY is the center of the telescope
    this.spaceX = 0;
    this.spaceY = 0;
    this.minX = 0;
    this.minY = 0;
    this.maxX = this.screenW;
    this.maxY = this.screenH;
    this.moveDist = 5;
    this.lastKey = 0;
    this.bRedraw = true;
    this.aStarMap = [];
    this.aConstMap = [];
    this.maxConst = 12;
    this.popup_ttxt = undefined;
    this.popup_ttxt2 = undefined;
    this.menu_ttxt_1 = undefined;
    this.menu_ttxt_2 = undefined;
    this.menu_ttxt_3 = undefined;
    this.menu_ttxt_4 = undefined;
    this.submit_ttxt = undefined;
    this.mcStars = undefined;
    this.mcConst = undefined;
    this.mcConst2 = undefined;
    this.objConst = undefined;
    this.mcOverlay = undefined;
    this.mcTele = undefined;
    this.mcCursor = undefined;
    this.objStation = undefined;
    this.selectionTool = this.SELECT_LINE;
    this.lastTool = this.selectionTool;
    this.bLineStarted = false;
    this.resURL = "http://www.neopets.com/altador/astro.phtml?star_submit=";
  }

  initialize(starData) {
    var char = starData.charCodeAt(starData.length - 1);
    if (char == 10 || char == 13) {
      starData = starData.substr(0, starData.length - 1);
    }
    var [starDataStars, starDataConstellations] = starData.split(":");
    starDataStars = starDataStars.split("|");
    starDataConstellations = starDataConstellations.split("|");
    var c = 0;

    // Build Constellation Map array
    for (var i = 0; i < starDataConstellations.length; i++) {
      var [constellationID, constellationStarsCoords] = starDataConstellations[c].split("!");
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
          var line = new lineClass(Number.parseInt(starCoords1[0]), Number.parseInt(starCoords1[1]) * -1);
          line.x2 = Number.parseInt(starCoords2[0]);
          line.y2 = Number.parseInt(starCoords2[1]) * -1;
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
          var starCoords = constellationStars[i].split(",");
          constellationStars.push([Number.parseInt(starCoords[0]), Number.parseInt(starCoords[1]) * -1]);
        }
      }
      var constellation = new constClass(constellationID, constellationStars, constellationLines);
      this.aConstMap.push(constellation);
    }

    var aStar = [];
    var starDataStars = aMain[0].split("|");
    var i = 0;
    var i = 0;
    // Build Star Map array
    for (var i = 0; i < starDataStars.length; i++) {
      if (starDataStars[i].length > 0) {
        aStar = starDataStars[i].split(",");
        this.aStarMap.push(new starClass(aStar, i + 1));
        if (Number.parseInt(aStar[this.STAR_POSX]) < this.minX) {
          this.minX = Number.parseInt(aStar[this.STAR_POSX]);
        } else if (Number.parseInt(aStar[this.STAR_POSX]) > this.maxX) {
          this.maxX = Number.parseInt(aStar[this.STAR_POSX]);
        }
        if (Number.parseInt(aStar[this.STAR_POSY]) < this.minY) {
          this.minY = Number.parseInt(aStar[this.STAR_POSY]);
        } else if (Number.parseInt(aStar[this.STAR_POSY]) > this.maxY) {
          this.maxY = Number.parseInt(aStar[this.STAR_POSY]);
        }
      }
      i++;
    }
    this.minX += this.scrW2;
    this.minY += this.scrH2;
    this.maxX -= this.scrW2;
    this.maxY -= this.scrH2;
    this.mcStars = _root.createEmptyMovieClip("mcstars", 100);
    this.mcConst = _root.createEmptyMovieClip("mcconst", 8000);
    this.mcConst._x = this.scrW2;
    this.mcConst._y = this.scrH2;
    this.mcConst2 = _root.createEmptyMovieClip("mcconst2", 7900);
    this.mcConst2._x = this.scrW2;
    this.mcConst2._y = this.scrH2;
    var sx = this.minX - this.screenW;
    var xm = 2 + Math.floor(Math.random() * 9);
    if (Math.floor(Math.random() * 6) > 2) {
      sx = this.maxX + this.screenW;
      xm *= -1;
    }
    var sy = this.minY - this.screenH;
    var ym = 2 + Math.floor(Math.random() * 9);
    if (Math.floor(Math.random() * 6) > 2) {
      sy = this.maxY + this.screenH;
      ym *= -1;
    }
    var clip = _root.attachMovie("mcSpaceStation", "mcstation", 8100, { _x: sx, _y: sy });
    var t = 30000 + Math.floor(Math.random() * 30000);
    this.objStation = { mc: clip, x: sx, y: sy, xmove: xm, ymove: ym, timer: t, xorig: sx, yorig: sy };
    this.mcOverlay = this.mcStars.attachMovie("mcOverlay", "mcoverlay", 8200);
    this.mcTele = _root.attachMovie("mcTelescope", "mctelescope", 9000);
    this.mcCursor = _root.attachMovie("mcCursor", "mccursor", 9100);
    this.objConst = new constellationClass(this.mcConst, this.mcConst2, this.aConstMap);
    this.objConst.init();
    if (this.aConstMap.length >= this.maxConst) {
      this.selectionTool = this.SELECT_NONE;
      this.nTeleState = this.ST_DONE;
    }
    this.selectTool(this.selectionTool);
  }


  main() {
    var xm = Number.parseInt(_root._xmouse);
    var ym = Number.parseInt(_root._ymouse);
    this.mcCursor._x = xm;
    this.mcCursor._y = ym;
    switch (this.nTeleState) {
      case this.ST_MENU:
        break;
      case this.ST_WAIT:
        break;
      case this.ST_WAIT2:
        break;
      case this.ST_PLAY:
        this.checkInput();
        if (this.bLineStarted) {
          var xm = this.mcTele._xmouse - this.scrW2 + this.spaceX;
          var ym = this.mcTele._ymouse - this.scrH2 + this.spaceY;
          var sx = this.spaceX;
          var sy = this.spaceY;
          this.objConst.updateLines(xm, ym, sx, sy);
        }
        break;
      case this.ST_DONE:
        this.checkInput();
    }
  };

  checkInput() {
    if (this.lastKey != 0) {
      if (this.lastKey == 37) {
        this.moveStars(1, 0);
      } else if (this.lastKey == 39) {
        this.moveStars(-1, 0);
      } else if (this.lastKey == 38) {
        this.moveStars(0, 1);
      } else if (this.lastKey == 40) {
        this.moveStars(0, -1);
      }
      this.lastKey = 0;
    }
    if (this.bRedraw) {
      this.bRedraw = false;
      this.updateStarMap();
    }
  };

  showMainMenu() {

    if (this.nTeleState == this.ST_PLAY) {
      if (this.bLineStarted) {
        this.objConst.removeCurrentLine();
        this.bLineStarted = false;
      }
      this.lastTool = this.selectionTool;
      this.selectTool(this.SELECT_NONE);
      this.nTeleState = this.ST_MENU;
      this.mcTele.menubutton.gotoAndStop(2);
    }
  };

  hideMainMenu() {

    this.selectTool(this.lastTool);
    this.nTeleState = this.ST_PLAY;
    this.mcTele.menubutton.gotoAndStop(1);
  };

  clickMainMenu(nSelect) {
    if (nSelect == 0) {
      this.selectTool(0);
    } else if (nSelect == 1) {
      this.selectTool(1);
    } else if (nSelect == 2) {
      this.selectTool(2);
    } else if (nSelect == 3) {
      this.deleteAll();
      if (this.lastTool == this.SELECT_DELETE) {
        this.lastTool = this.SELECT_LINE;
      }
      this.selectTool(this.lastTool);
    }
    this.nTeleState = this.ST_PLAY;
    this.mcTele.menubutton.gotoAndStop(1);
  };

  submitResult() {

    if (this.nTeleState == this.ST_PLAY) {
      this.mcTele.butSubmit2.gotoAndPlay(16);
      playSound(1);
      if (this.bLineStarted) {
        this.objConst.removeCurrentLine();
        this.bLineStarted = false;
      }
      var sConst = this.objConst.getResult();
      this.objLV.load(this.resURL + sConst);
      var popup = _root.attachMovie("mcPopup", "mcpopup", 9050);
      popup._x = 128;
      popup._y = 117;
      this.popup_ttxt = translator.addTextField(popup.tfield, { htmlText: _level0.IDS_menu_popup_1 });
      this.lastTool = this.selectionTool;
      this.selectTool(this.SELECT_NONE);
      this.nTeleState = this.ST_WAIT;
    }
  };

  selectTool(nTool) {

    if (this.bLineStarted) {
      this.objConst.removeCurrentLine();
      this.bLineStarted = false;
    }
    this.selectionTool = nTool;
    this.setCursor(nTool + 1);
  };

  setCursor(nCursor) {
    this.mcCursor.gotoAndStop(nCursor);
  };

  resetCursor(nCursor) {

    if (this.nTeleState == this.ST_PLAY) {
      this.mcCursor.gotoAndStop(nCursor);
    }
  };

  hiliteCursor(bHilite) {

    if (this.mcCursor.arr != undefined) {
      if (bHilite) {
        this.mcCursor.arr.gotoAndStop(2);
      } else {
        this.mcCursor.arr.gotoAndStop(1);
      }
    }
  };

  deleteAll() {
    this.bLineStarted = false;
    this.objConst.deleteAll();
    if (this.mcTele.butSubmit2._visible) {
      this.mcTele.butSubmit2.gotoAndStop(16);
      playSound(1);
    }
  };

  updateStarMap() {
    var star = undefined;
    var x1 = this.spaceX - this.scrW2;
    var x2 = this.spaceX + this.scrW2;
    var y1 = this.spaceY - this.scrH2;
    var y2 = this.spaceY + this.scrH2;
    for (var i = 0; i < this.aStarMap.length; i++) {
      star = this.aStarMap[i];
      star.bVisible = false;
      if (star.posX >= x1) {
        if (star.posX <= x2) {
          if (star.posY >= y1) {
            if (star.posY <= y2) {
              star.bVisible = true;
            }
          }
        }
      }
      if (star.bVisible) {
        if (!star.bCreated) {
          this.createStar(star);
          star.bCreated = true;
        }
        star.mc._x = star.posX - this.spaceX + this.scrW2;
        star.mc._y = star.posY - this.spaceY + this.scrH2;
      } else if (star.bCreated) {
        star.mc.removeMovieClip();
        star.mc = undefined;
        star.bCreated = false;
      }
    }
  };

  createStar(objStar) {
    var d = objStar.iIndex;
    var _loc2_ = this.mcStars.attachMovie("mcStar", "star_" + String(d), d);
    _loc2_.gotoAndStop(objStar.iType);
    _loc2_.objTele = this;
    _loc2_.posx = objStar.posX;
    _loc2_.posy = objStar.posY;
    _loc2_.realy = objStar.realY;
    _loc2_.onPress = function() {

      if (this.objTele.nTeleState == this.objTele.ST_PLAY) {
        this.objTele.starClicked(this.posx, this.posy, this.realy);
      }
    };
    // On mouse over
    _loc2_.onRollOver = function() {

      if (this.objTele.nTeleState == this.objTele.ST_PLAY || this.objTele.nTeleState == this.objTele.ST_DONE) {
        this._xscale = 200;
        this._yscale = 200;
        this.objTele.showOverlay(this._x, this._y, this.posx, this.realy);
      }
    };
    // On mouse out
    _loc2_.onRollOut = function() {

      if (this.objTele.nTeleState == this.objTele.ST_PLAY || this.objTele.nTeleState == this.objTele.ST_DONE) {
        this._xscale = 100;
        this._yscale = 100;
        this.objTele.showOverlay(-500, -500, undefined, undefined);
      }
    };
    objStar.mc = _loc2_;
  };

  bgClicked() {
    if (!(this.nTeleState != this.ST_PLAY && this.nTeleState != this.ST_DONE)) {
      var xm = Number.parseInt(_root._xmouse);
      var ym = Number.parseInt(_root._ymouse);
      if (!(xm < 0 || ym < 0 || xm > this.screenW || ym > this.screenH)) {
        playSound(0);
        var x = this.spaceX + (xm - this.scrW2);
        var y = this.spaceY + (ym - this.scrH2);
        var xNew = x - this.spaceX;
        var yNew = y - this.spaceY;
        var xOld = this.spaceX;
        var yOld = this.spaceY;
        var bUpdate = false;
        this.spaceX = x;
        if (this.spaceX < this.minX) {
          xNew = this.minX - xOld;
          this.spaceX = this.minX;
        } else if (this.spaceX > this.maxX) {
          xNew = this.maxX - xOld;
          this.spaceX = this.maxX;
        }
        this.mcConst._x -= xNew;
        this.mcConst2._x -= xNew;
        this.spaceY = y;
        if (this.spaceY < this.minY) {
          yNew = this.minY - yOld;
          this.spaceY = this.minY;
        } else if (this.spaceY > this.maxY) {
          yNew = this.maxY - yOld;
          this.spaceY = this.maxY;
        }
        this.mcConst._y -= yNew;
        this.mcConst2._y -= yNew;
        bUpdate = true;
        if (bUpdate) {
          this.mcTele.position.text = this.spaceX + ", " + this.spaceY * -1;
          this.placeStarBG(-xNew, -yNew);
          this.bRedraw = true;
        }
      }
    }
  };

  starClicked(x, y, realY) {
    if (this.nTeleState == this.ST_PLAY) {
      var boolean = true;
      if (this.selectionTool == this.SELECT_STAR) {
        boolean = this.objConst.addStar(x, y);
      } else if (this.selectionTool == this.SELECT_LINE) {
        if (this.objConst.addConnection(x, y)) {
          this.bLineStarted = !this.bLineStarted;
          if (this.bLineStarted) {
            boolean = false;
          }
        } else {
          boolean = false;
        }
      } else if (this.selectionTool == this.SELECT_DELETE) {
        boolean = this.objConst.deleteStar(x, y);
      }
      if (boolean) {
        playSound(2);
        if (this.objConst.completed()) {
          if (!this.mcTele.butSubmit2._visible) {
            this.mcTele.butSubmit2._visible = true;
            this.mcTele.butSubmit2.gotoAndPlay(2);
            playSound(1);
          }
        } else if (this.mcTele.butSubmit2._visible) {
          this.mcTele.butSubmit2.gotoAndStop(16);
          playSound(1);
        }
      } else {
        playSound(0);
      }
    }
  };

  showOverlay(x, y, posx, posy) {
    this.mcOverlay._x = x;
    this.mcOverlay._y = y;
    if (posx != undefined) {
      this.mcOverlay.starpos.text = posx + ", " + posy;
    }
  };

  moveStars(x, y) {
    bUpdate = true;
    var newX = x * this.moveDist;
    var newY = y * this.moveDist;
    if (x != 0) {
      var oldX = this.spaceX;
      this.spaceX -= newX;
      if (this.spaceX < this.minX) {
        this.spaceX = this.minX;
        newX = oldX - this.spaceX;
      } else if (this.spaceX > this.maxX) {
        this.spaceX = this.maxX;
        newX = oldX - this.spaceX;
      }
      this.mcConst._x += newX;
      this.mcConst2._x += newX;
    } else if (y != 0) {
      var oldY = this.spaceY;
      this.spaceY -= newY;
      if (this.spaceY < this.minY) {
        this.spaceY = this.minY;
        newY = oldY - this.spaceY;
      } else if (this.spaceY > this.maxY) {
        this.spaceY = this.maxY;
        newY = oldY - this.spaceY;
      }
      this.mcConst._y += newY;
      this.mcConst2._y += newY;
    }
    if (bUpdate) {
      this.mcTele.position.text = this.spaceX + ", " + this.spaceY * -1;
      this.placeStarBG(newX, newY);
      this.bRedraw = true;
    }
  };

  placeStarBG(xDist, yDist) {
    if (xDist != 0) {
      starbg1._x += xDist;
      starbg2._x += xDist;
      if (starbg1._x > 0) {
        starbg2._x = starbg1._x;
        starbg1._x = starbg2._x - this.starBgW;
      } else if (starbg2._x < 0) {
        starbg1._x = starbg2._x;
        starbg2._x = starbg1._x + this.starBgW;
      } else {
        starbg2._x = starbg1._x + this.starBgW;
      }
      starbg3._x = starbg1._x;
      starbg4._x = starbg2._x;
    }
    if (yDist != 0) {
      starbg1._y += yDist;
      starbg3._y += yDist;
      if (starbg1._y > 0) {
        starbg3._y = starbg1._y;
        starbg1._y = starbg3._y - this.starBgH;
      } else if (starbg3._y < 0) {
        starbg1._y = starbg3._y;
        starbg3._y = starbg1._y + this.starBgH;
      } else {
        starbg3._y = starbg1._y + this.starBgH;
      }
      starbg2._y = starbg1._y;
      starbg4._y = starbg3._y;
    }
  };

  keyPressed() {
    this.lastKey = Key.getCode();
  };

  moveSpaceStation(t, spaceX, spaceY) {

    this.objStation.x += this.objStation.xmove;
    this.objStation.y += this.objStation.ymove;
    this.objStation.timer = t + 30;
    var boolean = false;
    if (this.objStation.xmove > 0) {
      if (this.objStation.x > this.maxX + this.screenW) {
        boolean = true;
      }
    } else if (this.objStation.x < this.minX - this.screenW) {
      boolean = true;
    }
    if (this.objStation.ymove > 0) {
      if (this.objStation.y > this.maxY + this.screenH) {
        boolean = true;
      }
    } else if (this.objStation.y < this.minY - this.screenH) {
      boolean = true;
    }
    if (boolean) {
      this.objStation.timer = t + 60000;
      this.objStation.x = this.objStation.xorig;
      this.objStation.y = this.objStation.yorig;
    }
    this.objStation.mc._x = this.scrW2 + (this.objStation.x - spaceX);
    this.objStation.mc._y = this.scrH2 + (this.objStation.y - spaceY);
  };
}