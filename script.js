const colorClasses = {blue: "blu", red: "bad", green: "good"}

const sides = ["a", "b", "c"]
const sideColors = ["blue", "red", "green"]
const angles = [[1, 2], [2, 0], [0, 1]]
const angleIds = angles.map(arr => arr.map(n => sides[n]).join(""))

const sideSyms = sides.map((side, i) => `<i class="${colorClasses[sideColors[i]]}">${side}</i>`)
const angSyms = [[1, 2], [2, 0], [0, 1]].map(([s1, s2]) => `${sideSyms[s1]}∠${sideSyms[s2]}`)

const inputs = Object.fromEntries(sides.concat(angleIds).map(id => [id, NaN]))
let triangle = Object.assign({}, inputs)

window.addEventListener("load", () => {
	const genLabel = (forId, text) => {
		const result = document.createElement('label')
		result.for = forId
		result.innerHTML = text
		return result
	}

	const genInput = (id) => {
		const result = document.createElement('input')
		result.id = id
		result.autofocus = true
		result.type = 'number'
		result.value = ''
		// TODO: this is one-way data-bound right now - might we ever want two-way?
		result.addEventListener('input', (ev) => {
			inputs[id] = parseFloat(ev.target.value)
			history.replaceState(null, null, `#${Object.entries(inputs).filter(([_, v]) => !isNaN(v)).map(([k, v]) => k + '=' + v).join("&")}`)
			solve(inputs)
		})
		return result
	}

	const form = document.querySelector('form')

	for (const i in sides) {
		form.appendChild(genLabel(sides[i], `Side ${sideSyms[i]} (length)`))
		form.appendChild(genInput(sides[i]))
	}

	for (const i in angles) {
		form.appendChild(genLabel(angleIds[i], `Angle ${angSyms[i]} (length)`))
		form.appendChild(genInput(angleIds[i]))
	}

	const handleHash = () => {
		const o = Object.fromEntries(location.hash.substr(1).split("&").map(s => s.split("=")))
		let isUpdate = Object.keys(o).some(k => o[k] != inputs[k])
		for (const key in o) {
			document.getElementById(key).value = o[key]
			inputs[key] = parseFloat(o[key])
		}
		if (isUpdate) solve(inputs)
	}

	window.addEventListener("hashchange", handleHash)
	handleHash()

	// TODO: load values from URL

	requestAnimationFrame(() => {
		if (sides.concat(angleIds).some(id => {
			document.getElementById(id).value != ""
		})) {
			solve(inputs)
		}
	})
})

function getCanvas() {
	return document.querySelector("canvas")
}

function clearCanvas() {
	const canvas = getCanvas()
	const ctx = canvas.getContext('2d')
	ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function clearOutput() {
	document.getElementById("output").innerHTML = ""
}

function addOutput(x) {
	document.getElementById("output").innerHTML += x
}

function solve({a, b, c, bc, ca, ab}) {
	let method = null
	console.log(a,b,c,bc,ca,ab)
	
	const numSides = [a, b, c].filter(x => !isNaN(x)).length
	const numAngles = [bc, ca, ab].filter(x => !isNaN(x)).length

	if (numSides == 0 && numAngles >= 3) {
		method = maybeAAAMethod({bc, ca, ab})
	}	else if (numSides == 1 && numAngles >= 2) {
		method = solveSAA
	} else if (numSides == 2 && numAngles >= 1) {
		method = solveSSA
	} else if (numSides == 3) {
		method = solveSSS
	}

	clearOutput()
	if (method == null) {
		addOutput("No solvable method available. Please see the 'About this page' section near the top of this page for details.")
	} else {
		triangle = method({a, b, c, bc, ca, ab})
		solveComplete(triangle)
	}
}

function maybeAAAMethod({bc, ca, ab}) {
	if (ab + bc + ca == 180) {
		addOutput("<span class='ylw'>With three angles, it is impossible to know the sizes of the sides. We will assume side <i class='blu'>a</i> is 1.</span><br /><br />")
		a = 1
		return () => solveSAA(1, NaN, NaN, bc, ca, ab)
	} else {
		addOutput(`<span class='bad'>These angles make an impossible triangle: their sum is not 180 degrees. It is ${ab + bc + ca}.</span>`)
		return null
	}
}

function lawOfCos1(t, keysToFind) {
	if (Array.isArray(keysToFind)) keysToFind.reduce((acc, key) => lawOfCos1(acc, key))
	const i = angleIds.indexOf(keysToFind)
	const [a, b] = angles[i]
	const h = t[sides[i]]
	const l1 = t[sides[(i + 1) % 3]]
	const l2 = t[sides[(i + 2) % 3]]
	let result = (l1 * l1 + l2 * l2 - h * h) / (2 * l1 * l2)
	if (result >= -1 && result <= 1) {
		t[keysToFind] = radToDeg(Math.acos(result))
		addOutput(`Determined missing angle ${angSyms[i]} via Law of Cosines<p class="in"><i>acos((<i>" + c + "<sup>2</sup> + " + b + "<sup>2</sup> - " + a + "<sup>2</sup>)/(2(" + b + ")(" + c + "))) &asymp; " + result + "&deg;<br />`)
	} else {
		// no solution
	}
	return result
}


function solveSSS(t) {
	const bc = lawOfCos1(a, b, c)
	const ca = lawOfCos1(b, c, a)
	const ab = lawOfCos1(c, a, b)
	return {a, b, c, bc, ca, ab, ds: false, ds2: false}
	return lawOfCos1(t, ["bc", "ca", "ab"])
}

function resolveSingleMissingAngle(t) {
	const i = angleIds.findIndex(id => isNaN(t[id]))
	const sub1id = (i + 1) % 3
	const sub2id = (i + 2) % 3
	const sub1 = t[angleIds[sub1id]]
	const sub2 = t[angleIds[sub2id]]
	const result = 180 - sub1 - sub2
	t[angleIds[i]] = result
	addOutput(`Determined missing angle ${angSyms[i]} via Triangle Sum Theorem<p class="in"><i>${angSyms[i]} := 180 - ${angSyms[sub1id]} (${sub1}) - ${angSyms[sub2id]} (${sub2}) = ${result}</i></p>`)
	return t
}

function resolveTwoMissingSides(t) {
	// note which two sides are missing values
	// use law of sin to calculate their lengths
	for (const id of angleIds) {
	}
}

function solveSAA(t) {
	let missingSides = ["b", "c"]
	if (!isNaN(b)) missingSides = ["a", "c"]
	else if (!isNaN(c)) missingSides = ["a", "b"]
	return lawOfSin1(resolveSingleMissingAngle(t), missingSides)
}

function solveSSA(a,b,c,A,B,C)
{
	var known = ""
	var an = 0
	if (!isNaN(a))
	{
		known += "a"
	}
	if (!isNaN(A))
	{
		known += "A"
		an = 1
	}
	if (!isNaN(b))
	{
		known += "b"
	}
	if (!isNaN(B))
	{
		known += "B"
		an = 2
	}
	if (!isNaN(c))
	{
		known += "c"
	}
	if (!isNaN(C))
	{
		known += "C"
		an = 3
	}
	
	if (known == "abC" || known == "aBc" || known == "Abc")
	{
		if (an == 1)
		{ 
			a = lawOfCos2(c,b,A); 
			B = lawOfSin2(b,a,A)
			C = lawOfSin2(c,a,A)
			addOutput("Performed a Law of Cosines: <i>&radic;(" + b + "<sup>2</sup> + " + c + "<sup>2</sup>-2(" + b + ")(" + c + ")cos(" + A + ")) &asymp; " + a + "</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + b + "(sin(" + A + ")/" + a + ")) = " + B + "&deg;</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + c + "(sin(" + A + ")/" + a + ")) = " + C + "&deg;</i><br /><br />")
		}
		else if (an == 2)
		{ 
			b = lawOfCos2(c,a,B); 
			A = lawOfSin2(a,b,B)
			C = lawOfSin2(c,b,B)
			addOutput("Performed a Law of Cosines: <i>&radic;(" + a + "<sup>2</sup> + " + b + "<sup>2</sup>-2(" + a + ")(" + c + ")cos(" + B + ")) &asymp; " + b + "</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + a + "(sin(" + B + ")/" + b + ")) = " + A + "&deg;</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + c + "(sin(" + B + ")/" + b + ")) = " + C + "&deg;</i><br /><br />")
		}
		else
		{ 
			c = lawOfCos2(b,a,C); 
			B = lawOfSin2(b,c,C)
			A = lawOfSin2(a,c,C)
			addOutput("Performed a Law of Cosines: <i>&radic;(" + b + "<sup>2</sup> + " + a + "<sup>2</sup>-2(" + b + ")(" + a + ")cos(" + C + ")) &asymp; " + c + "</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + b + "(sin(" + C + ")/" + c + ")) &asymp; " + B + "&deg;</i><br />")
			addOutput("Performed a Law of Sines: <i>asin(" + a + "(sin(" + C + ")/" + c + ")) &asymp; " + A + "&deg;</i><br /><br />")
		}
		return {a:a,b:b,c:c,A:A,B:B,C:C,ds:false,ds2:false}
	}
	else
	{
		var kna = 0
		var kns = 0
		var pas = 0
		var paa = 0
		var una = 0
		var uns = 0
		
		var paa2 = 0
		var una2 = 0
		var uns2 = 0
		
		var ds = false
				
		if (!isNaN(a) && !isNaN(A))
		{
			kns = a
			kna = A
		}
		if (!isNaN(b) && !isNaN(B))
		{
			kns = b
			kna = B
		}
		if (!isNaN(c) && !isNaN(C))
		{
			kns = c
			kna = C
		}
		
		if (!isNaN(a) && isNaN(A)) 
		{
			pas = a
		}
		if (!isNaN(b) && isNaN(B)) 
		{
			pas = b
		}
		if (!isNaN(c) && isNaN(C)) 
		{
			pas = c
		}
		
		var ops = kns
		var ads = pas
		var hgt = ads*Math.sin(kna)
		
		var sol = 0
		
		if (ads < ops)
		{
			sol = 1
		}
		else if (ops < ads)
		{
			if (kna < 90)
			{
				if (ops == hgt)
				{
					sol = 1
				}
				else if (ops > hgt)
				{
					sol = 2
				}
			}
		}
		else 
		{
			if (kna < 90)
			{
				sol = 1
			}
		}
		addOutput("<br />")
		
		if (sol == 0)
		{
			addOutput("<span class='ylw'>No Solution.</span><br />")
			return {a:a,b:b,c:c,A:A,B:B,C:C}
		}
		else if (sol == 1)
		{
			addOutput("One Solution.<br /><br />")
			paa = lawOfSin2(pas, kns, kna)
			una = 180 - kna - paa
			uns = lawOfSin1(una, kns, kna)
		}
		else if (sol == 2)
		{
			ds = true
			addOutput("Two Solutions.<br /><br />")
			paa = lawOfSin2(pas, kns, kna)
			una = 180 - kna - paa
			uns = lawOfSin1(una, kns, kna)
			
			paa2 = 180 - lawOfSin2(pas, kns, kna)
			una2 = 180 - kna - paa2
			uns2 = lawOfSin1(una2, kns, kna)
		}
		
		var a2 = 0
		var b2 = 0
		var c2 = 0
		var A2 = 0
		var B2 = 0
		var C2 = 0
		
		if (ds)
		{					
			a2 = a
			b2 = b
			c2 = c
			A2 = A
			B2 = B
			C2 = C
			
			if (!isNaN(a) && isNaN(A))
				A2 = paa2
			if (!isNaN(b) && isNaN(B))
				B2 = paa2
			if (!isNaN(c) && isNaN(C))
				C2 = paa2;			

			if (isNaN(a) && isNaN(A))
			{
				a2 = uns2
				A2 = una2
			}
			if (isNaN(b) && isNaN(B))
			{
				b2 = uns2
				B2 = una2
			}
			if (isNaN(c) && isNaN(C))
			{
				c2 = uns2
				C2 = una2
			}
		}		
		
		if (!isNaN(a) && isNaN(A))
			A = paa
		if (!isNaN(b) && isNaN(B))
			B = paa
		if (!isNaN(c) && isNaN(C))
			C = paa;			

		if (isNaN(a) && isNaN(A))
		{
			a = uns
			A = una
		}
		if (isNaN(b) && isNaN(B))
		{
			b = uns
			B = una
		}
		if (isNaN(c) && isNaN(C))
		{
			c = uns
			C = una
		}
		
		// los2 return radToDeg(Math.asin((a * Math.sin(degToRad(B)))/b))
		/*
		
			paa = lawOfSin2(pas, kns, kna)
			una = 180 - kna - paa
			uns = lawOfSin1(una, kns, kna)
			
		*/
		if (sol == 2)
			addOutput("<span class='good'>Solution for 2nd Triangle (Brighter Colors)</span><br /><br />")
		addOutput("Performed a Law of Sines: <i>asin(" + pas + "(sin(" + kna + ")/" + kns + ") &asymp; " + paa + "</i><br />")
		addOutput("<br />All Angles Determined: <p class='in'><i>a</i> &asymp; <i>" + A + "&deg;</i><br /><i>b</i> &asymp; <i>" + B + "&deg;</i><br /><i>c</i> &asymp; <i>" + C + "&deg;</i></p>")
		addOutput("Performed a Law of Sines: <i>sin(" + una + ")/(sin(" + kna + ")/" + kns + ") &asymp; " + paa + "</i><br />")
		// los1 return Math.sin(degToRad(A))/(Math.sin(degToRad(B))/b)
		
		return {a:a,b:b,c:c,A:A,B:B,C:C,ds:ds,ds2:false,a2:a2,b2:b2,c2:c2,A2:A2,B2:B2,C2:C2}
	}
}

function solveComplete(triangle)
{
	let {a, b, c, bc, ca, ab} = triangle
	if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(bc) || isNaN(ca) || isNaN(ab)) {
		addOutput("<p class='bad'>Solve Failed. Your triangle is impossible. Check your input and try again!</p>")
		return
	}
	if (bc < 0 || ca < 0 || ab < 0) {
		addOutput("<p class='bad'>Solve Failed. Your triangle has negative angles. Double-check your inputs!")
		return
	}
	const angleSum = bc + ca + ab - 180
	if (angleSum > 0.01 || angleSum < -0.01) {
		addOutput("<p class='bad'>Solve Failed. Your triangle's angles do not add up to 180&deg; (Triangle Sum Theorem)</p>")
		return
	}
	bc = Math.round(bc*1000)/1000
	ca = Math.round(ca*1000)/1000
	ab = Math.round(ab*1000)/1000
	a = Math.round(a*1000)/1000
	b = Math.round(b*1000)/1000
	c = Math.round(c*1000)/1000
	const sidesOut = sides.map((side, i) => `${sideSyms[i]} &asymp; ${Math.round(triangle[side] * 1000) / 1000}`).join(", ")
	const angsOut = angleIds.map((ang, i) => {
		console.log(ang)
		return `${angSyms[i]} &asymp; ${Math.round(triangle[ang] * 1000) / 1000}`
	}).join(", ")
	addOutput(`<p class='good'>Triangle Solved</p><p class='in'><i>${sidesOut}, ${angsOut}</i></p>`)
	drawTriangle(triangle)
}

function lawOfCos2(a,b,C) {
	return Math.sqrt(a*a+b*b-2*a*b*Math.cos(degToRad(C)))
}

function lawOfSin1(t, keysToFind) {
	if (Array.isArray(keysToFind)) keysToFind.reduce((acc, key) => lawOfSin1(acc, key))
	const i = sides.indexOf(keyToFind)
	const knownI = sides.findIndex(n => !isNaN(t[n]))
	t[sides[i]] = (t[sides[knownI]] / Math.sin(degToRad(t[angleIds[knownI]]))) * Math.sin(degToRad(t[angleIds[i]]))
	addOutput(`Determined missing side ${sideSyms[i]} via Law of Sines<p class="in"><i>${sideSyms[i]} := (${sideSyms[knownI]} (${t[sides[knownI]]}) / sin(${angSyms[knownI]} (${t[angleIds[knownI]]}))) &times; sin(${angSyms[i]} (${t[angleIds[i]]})) &asymp; ${t[sides[i]]}</i></p>`)
	return t
}

function lawOfSin2(a,b,B) {
	return radToDeg(Math.asin((a * Math.sin(degToRad(B)))/b))
}

function degToRad(x) {
	return x / 180 * Math.PI
}

function radToDeg(x) {
	return x / Math.PI * 180
}

function drawTriangle({a, b, c, bc, ca, ab})
{
	console.log("Drawing", a, b, c, bc, ca, ab)
	clearCanvas()
	const canvas = getCanvas()
	const ctx = canvas.getContext('2d')

	const offset = 20
	const dx = Math.cos(ab) * b
	const dy = Math.sin(ab) * b
	console.log(dx, dy)
	const coords = [[0, 0], [0, a], [dx, a - dy], [0, 0]]
	const strokeStyles = ["#00aaff", "#ff0000", "#44ff00"]

	for (const i in coords) {
		if (i == 0) continue
		ctx.beginPath()
		const [bx, by] = coords[i - 1]
		console.log("moveto:", offset + bx, offset + by)
		ctx.moveTo(offset + bx, offset + by)
		const [x, y] = coords[i]
		ctx.lineWidth = 2
		ctx.lineTo(offset + x, offset + y)
		console.log("lineto:", offset + x, offset + y)
		ctx.strokeStyle = strokeStyles[i - 1]
		ctx.stroke()
	}
	ctx.restore()

	// leg1 = (leg1/baseline)
	// leg2 = (leg2/baseline)
	// baseline = 180
	// var np2x = 0
	// var np2y = 0
	// var np1x = 0
	// var np1y = 0
	// np2x = -Math.cos(degToRad(l1a))*180*leg2
	// np2y = -Math.sin(degToRad(l1a))*180*leg2;	
	// var ox = 155
	// var oy = (194/2)-(np2y/2)
	// var x = ox
	// var y = oy
	// ctx.lineWidth = 2
	// 
	// ctx.beginPath()
	// ctx.strokeStyle = stst[drawOrder.substring(0,1)]
	// ctx.moveTo(x,y)
	// x += 180
	// ctx.lineTo(x,y)
	// ctx.stroke()
	// ctx.restore()
	// 
	// ctx.beginPath()
	// ctx.moveTo(x,y)
	// ctx.strokeStyle = stst[drawOrder.substring(1,2)]
	// x += np2x
	// y += np2y
	// ctx.lineTo(x,y)
	// ctx.stroke()
	// ctx.restore()
	// 
	// ctx.beginPath()
	// ctx.moveTo(x,y)
	// ctx.strokeStyle = stst[drawOrder.substring(2,3)]
	// ctx.lineTo(ox,oy)
	// ctx.stroke()
	// ctx.restore()
}
