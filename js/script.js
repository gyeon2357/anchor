$(document).ready(function () {
  $("html, body").scrollTop(0);
  $content = $(".content");
  $link = $content.find("a");
  $link.on("click", function (e) {
    e.preventDefault();
    var href = $(this).attr("href");
    var options =
      "width=640, height=640, status=no, menubar=no, toolbar=no";
    window.open(href, "", options);
  });
});

$(window).on("load", function () {
  var $header = $(".header");
  var $title = $(".title");
  var $main = $(".main");
  var delay = 600;

  setTimeout(function () {
    $title.fadeIn(delay);

    setTimeout(function () {
      $title.find("div").eq(0).show(0);

      setTimeout(function () {
        $title
          .find("div")
          .eq(1)
          .fadeOut(delay, function () {
            $header.fadeOut(delay + 100);
            $main.animate(
              {
                "margin-top": 0,
              },
              delay
            );
            $("html, body").scrollTop(0);
            $("body").removeClass("fixed");
          });
      }, delay * 4);
    });
  }, delay);
});

//
// * 2021. 09. 09. (c) jeong.gyeony@gmail.com
//

keywords = ['sailing ship'];

let url = "https://source.unsplash.com/";

let direction = "vertical";
let threshold = 50;
let pixelDistance = 1;

let editable = true;
let editRadius = 70;

let img;
let changes;

function preload() {
	img = loadImage(url + str(windowWidth) + 'x' + str(windowHeight) + '/?' + random(keywords));
}

let lineNumber,
  lineCount = 0,
  fractional = [],
  sparkLines = [];




function setup() {
	createCanvas(img.width, img.height);
	generatePixelSort();
	//noLoop();
}

function draw() {
	image(img, 0, 0);
	// if(editable) {
	// 	push();
	// 	noStroke();
	// 	fill(240, 248, 255);
	// 	circle(mouseX, mouseY, editRadius * 2);
	// 	pop();
	// }


	textFont("Courier"),
	textSize(12),
	(lineNumber = 1),
	labelAndValue("", mouseX),
	labelAndValue("", mouseY),
	labelAndValue("", frameCount % 30),
	labelAndValue("", sin(frameCount)),
	labelAndValue("", tan(frameCount % 100)),
	labelAndValue("", mouseIsPressed);
}

function labelAndValue(e, n) {
  var l = map(lineNumber, 0, lineCount, 320, height);
  let a = sparkLines[lineNumber];
  a ||
    ((a = sparkLines[lineNumber] = new SparkLine()),
    (fractional[lineNumber] = !1)),
    (fractional[lineNumber] = fractional[lineNumber] || Boolean(n % 1)),
    a.appendValue(n),
    textAlign(LEFT),
    text(e, 12, l),
    textAlign(LEFT),
    text(fractional[lineNumber] ? n.toFixed(3) : n, 30, l),
    a.draw(120, l),
    (lineNumber += 1),
    (lineCount = max(lineNumber, lineCount));
}
let groupStartIndex;
function beginGroup() {
  groupStartIndex = lineNumber;
}
function endGroup() {
  let e = sparkLines.slice(groupStartIndex, lineNumber);
  var n = min(...e.map(e => e.min)),
    l = max(...e.map(e => e.max));
  e.forEach(e => {
    (e.min = n), (e.max = l);
  });
}

class SparkLine {
  constructor() {
    this.min = Infinity;
    this.max = -Infinity;
    this.values = [];
  }

  appendValue(value) {
    this.min = min(this.min, value);
    if (value > this.max) {
      this.max = max(2 * this.max, value);
    }
    this.values.push(value);
    if (this.values.length > 300) {
      this.values.shift();
    }
  }

  draw(x, y) {
    while (this.values.length > width - x) {
      this.values.shift();
    }
    for (let i = 0; i < this.values.length; i++) {
      let h = map(Number(this.values[i]), 0, this.max, 0, 100);
      rect(
        x + i,
        y + map(0, Number(this.min), Number(this.max), 0, 5),
        1,
        -h
      );
    }
  }
}

// pixelSort

function generatePixelSort() {
	changes = detectPixelChanges(img, threshold, pixelDistance, direction, false);
	for (let i = 0; i < changes.length; i++) {
		if (i < changes.length - 1) {
			pixelSortTo(
				img,
				changes[i].x,
				changes[i].y,
				changes[i + 1].x,
				changes[i + 1].y,
				direction
			);
		} else {
			pixelSort(img, changes[i].x, changes[i].y, direction);
		}
	}
	img.updatePixels();
}

function detectPixelChanges(
	img,
	threshold,
	distance = 300,
	direction = "vertical",
	onlyFirst = true
) {
	let results = [];
	direction =
		direction == "horizontal" ? createVector(10, 0) : createVector(0, 1);
	let pos = createVector();

	for (let j = 0, lim = direction.x ? img.height : img.width; j < lim; j++) {
		for (let i = 0, lim = direction.x ? img.width : img.height; i < lim; i++) {
			let colBefore = getPixelValue(
				img,
				direction.x ? i - distance : j,
				direction.x ? j : i - distance
			);
			if (colBefore) {
				let col = getPixelValue(img, direction.x ? i : j, direction.x ? j : i);
				let d = dist(
					colBefore[0],
					colBefore[1],
					colBefore[2],
					col[0],
					col[1],
					col[2]
				);
				if (d > threshold) {
					//point(direction.x ? i : j, direction.x ? j : i);
					results.push(createVector(direction.x ? i : j, direction.x ? j : i));
					if (onlyFirst) break;
				}
			}
		}
	}
	return results;
}

function getPixelValue(img, x, y) {
	if (x < 0 || x > img.width - 1 || y < 0 || y > img.height - 1) return null;
	if (!img.pixels.length) img.loadPixels();
	let i = 4 * (x + y * img.width);
	let r = img.pixels[i];
	let g = img.pixels[i + 1];
	let b = img.pixels[i + 2];
	let a = img.pixels[i + 3];
	return [r, g, b, a];
}

function setPixelValue(img, x, y, colR, colG, colB, colA = 255) {
	if (x < 0 || x > img.width - 1 || y < 0 || y > img.height - 1) return null;
	if (!img.pixels.length) img.loadPixels();
	let i = 4 * (x + y * img.width);
	img.pixels[i] = colR;
	img.pixels[i + 1] = colG;
	img.pixels[i + 2] = colB;
	img.pixels[i + 3] = colA;
}

function pixelSort(img, x, y, direction = "vertical") {
	direction =
		direction == "horizontal" ? createVector(1, 0) : createVector(0, 1);
	let pix = [];
	let start = direction.x ? x : y;
	let end = direction.x ? img.width : img.height;
	for (let i = start; i < end; i++) {
		let val = getPixelValue(img, direction.x ? i : x, direction.x ? y : i);
		pix.push(val);
	}

	pix.sort(sortFunction);
	let i = 0;
	for (let p of pix) {
		setPixelValue(
			img,
			x + direction.x * i,
			y + direction.y * i,
			p[0],
			p[1],
			p[2]
		);
		i++;
	}
}

function pixelSortTo(img, x1, y1, x2, y2, direction = "vertical") {
	direction =
		direction == "horizontal" ? createVector(1, 0) : createVector(0, 1);
	let pix = [];
	let start = direction.x ? x1 : y1;
	let end = direction.x ? img.width : img.height;
	for (let i = start; i < end; i++) {
		let x = direction.x ? i : x1;
		let y = direction.x ? y1 : i;
		if (x == x2 && y == y2) break;
		let val = getPixelValue(img, x, y);
		pix.push(val);
	}

	pix.sort(sortFunction);
	let i = 0;
	for (let p of pix) {
		setPixelValue(
			img,
			x1 + direction.x * i,
			y1 + direction.y * i,
			p[0],
			p[1],
			p[2]
		);
		i++;
	}
}

function sortFunction(a, b) {
	//return brightness(color(b[0], b[1], b[2])) - brightness(color(a[0], a[1], a[2]));
	//return b[0] * b[1] * b[2] - a[0] * a[1] * a[2];
	return -(b[0] - a[0] + b[1] - a[1] + b[2] - a[2]);
}

// function mouseWheel(event) {
// 	editRadius += event.delta / 10;
// 	editRadius = constrain(editRadius, 5, 200);
// }

// function mouseClicked() {
// 	remove
// }

