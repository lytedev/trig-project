function solve()
{

	var canvas = document.getElementById("triangle");
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	var sb = parseFloat(document.getElementById("b").value);
	var sa = parseFloat(document.getElementById("a").value);
	var sc = parseFloat(document.getElementById("c").value);
	var aa = parseFloat(document.getElementById("A").value);
	var ab = parseFloat(document.getElementById("B").value);
	var ac = parseFloat(document.getElementById("C").value);
	var v1 = 0;
	var v2 = 0;
	var v3 = 0;
	var method = "";
	
	if (!isNaN(sa))
	{
		method = method + "S";
		v1 = sa;
	}
	
	if (!isNaN(sb))
	{
		method = method + "S";
		if (v1 == 0) {
			v1 = sb; }
		else { v2 = sb; }
	}
	
	if (!isNaN(sc))
	{
		method = method + "S";
		if (v1 == 0) {
			v1 = sc; }
		else if (v2 == 0) {
			v2 = sc; }
		else if (v3 == 0) {
			v3 = sc; }
	}
	
	if (!isNaN(aa))
	{
		if (method.length < 3)
			method = method + "A";
		if (v1 == 0) {
			v1 = aa; }
		else if (v2 == 0) {
			v2 = aa; }
		else if (v3 == 0) {
			v3 = aa; }
	}
	
	if (!isNaN(ab))
	{
		if (method.length < 3)
			method = method + "A";
		if (v1 == 0) {
			v1 = ab; }
		else if (v2 == 0) {
			v2 = ab; }
		else if (v3 == 0) {
			v3 = ab; }
	}
	
	if (!isNaN(ac))
	{
		if (method.length < 3)
			method = method + "A";
		if (v1 == 0) 
		{
			v1 = ac; 
		}
		else if (v2 == 0) 
		{
			v2 = ac; 
		}
		else if (v3 == 0) 
		{
			v3 = ac; 
		}
	}
	
	var m1 = "";
	var m2 = "";
	var m3 = "";
	
	var v1mod = v1;
	var v2mod = v2;
	var v3mod = v3;
	
	if (method.substring(0, 1) == "A") 
	{
		m1 = "Angle"; 
		v1mod = v1 + "&deg;";
	}
	else 
	{
		m1 = "Side"; 
	}
	
	if (method.substring(1, 2) == "A")	
	{
		m2 = "Angle"; 
		v2mod = v2 + "&deg;";
	}
	else 
	{
		m2 = "Side"; 
	}
	
	if (method.substring(2, 3) == "A")	
	{
		m3 = "Angle"; 
		v3mod = v3 + "&deg;";
	}
	else 
	{
		m3 = "Side"; 
	}
	
	clearOutput();
	addOutput("Attempted Method: " + method + "<br />");
	addOutput("Variable 1: " + v1mod + " " + m1 + "<br />");
	addOutput("Variable 2: " + v2mod + " " + m2 + "<br />");
	addOutput("Variable 3: " + v3mod + " " + m3 + "<br /><br />");
	
	if (method == "AAA") 
	{
		if (v1 + v2 + v3 == 180)
		{
			addOutput("<span class='ylw'>With three angles, it is impossible to know the sizes of the sides. We will assume side <i>a</i> is 1.</span><br /><br />");
			sa = 1;
			var tri = solveSAA(sa,sb,sc,aa,ab,ac);
			solveComplete(tri);
		}
		else
		{
			addOutput("<span class='bad'>These angles are incorrect. Their sum is not 180, it is " + (v1 + v2 + v3) + ".</span>");
		}
	}	
	else if (method == "SSS")
	{
		var tri = solveSSS(sa,sb,sc);
		solveComplete(tri);
	}	
	else if (method == "SAA")
	{
		var tri = solveSAA(sa,sb,sc,aa,ab,ac);
		solveComplete(tri);
	}
	else if (method == "SSA")
	{
		var tri = solveSSA(sa,sb,sc,aa,ab,ac);
		solveComplete(tri);
	}
	
	else 
	{
		addOutput("No solvable method available. Please read description near top for details.");
	}
}

function solveSSS(a,b,c)
{
	var A = lawOfCos1(a,b,c);
	addOutput("Performed a Law of Cosines: acos((<i>" + c + "<sup>2</sup> + " + b + "<sup>2</sup> - " + a + "<sup>2</sup>)/(2(" + b + ")(" + c + "))) &asymp; " + A + "&deg;<br />");
	var B = lawOfCos1(b,c,a);
	addOutput("Performed a Law of Cosines: acos((<i>" + a + "<sup>2</sup> + " + c + "<sup>2</sup> - " + b + "<sup>2</sup>)/(2(" + c + ")(" + a + "))) &asymp; " + B + "&deg;<br />");
	var C = lawOfCos1(c,a,b);
	addOutput("Performed a Law of Cosines: acos((<i>" + b + "<sup>2</sup> + " + a + "<sup>2</sup> - " + c + "<sup>2</sup>)/(2(" + a + ")(" + b + "))) &asymp; " + C + "&deg;<br /><br />");
	return {a:a,b:b,c:c,A:A,B:B,C:C,ds:false,ds2:false};
}

function solveSAA(a,b,c,A,B,C)
{
	if (isNaN(A))
	{
		A = 180 - B - C;
	}
	else if (isNaN(B))
	{
		B = 180 - A - C;
	}
	else if (isNaN(C))
	{
		C = 180 - A - B;
	}
	addOutput("All Angles Determined: <p class='in'><i>a</i> &asymp; <i>" + A + "&deg;</i><br /><i>b</i> &asymp; <i>" + B + "&deg;</i><br /><i>c</i> &asymp; <i>" + C + "&deg;</i></p>");
	if (!isNaN(a))
	{
		b = lawOfSin1(B,a,A);
		c = lawOfSin1(C,a,A);
		addOutput("Performed a Law of Sines: <i>sin(" + B + ")/(sin(" + A + ")/" + a + ") &asymp; " + b + "<br />");
		addOutput("Performed a Law of Sines: <i>sin(" + C + ")/(sin(" + A + ")/" + a + ") &asymp; " + c + "<br /><br />");
	}
	else if (!isNaN(b))
	{
		a = lawOfSin1(A,b,B);
		c = lawOfSin1(C,b,B);
		addOutput("Performed a Law of Sines: <i>sin(" + A + ")/(sin(" + B + ")/" + b + ") &asymp; " + a + "<br />");
		addOutput("Performed a Law of Sines: <i>sin(" + C + ")/(sin(" + B + ")/" + b + ") &asymp; " + c + "<br /><br />");
	}
	else if (!isNaN(c))
	{
		a = lawOfSin1(A,c,C);
		b = lawOfSin1(B,c,C);
		addOutput("Performed a Law of Sines: <i>sin(" + A + ")/(sin(" + C + ")/" + c + ") &asymp; " + a + "<br />");
		addOutput("Performed a Law of Sines: <i>sin(" + B + ")/(sin(" + C + ")/" + c + ") &asymp; " + b + "<br /><br />");
	}
	return {a:a,b:b,c:c,A:A,B:B,C:C,ds:false,ds2:false};
}

function solveSSA(a,b,c,A,B,C)
{
	var known = "";
	var an = 0;
	if (!isNaN(a))
	{
		known += "a";
	}
	if (!isNaN(A))
	{
		known += "A";
		an = 1;
	}
	if (!isNaN(b))
	{
		known += "b";
	}
	if (!isNaN(B))
	{
		known += "B";
		an = 2;
	}
	if (!isNaN(c))
	{
		known += "c";
	}
	if (!isNaN(C))
	{
		known += "C";
		an = 3;
	}
	
	if (known == "abC" || known == "aBc" || known == "Abc")
	{
		if (an == 1)
		{ 
			a = lawOfCos2(c,b,A); 
			B = lawOfSin2(b,a,A);
			C = lawOfSin2(c,a,A);
			addOutput("Performed a Law of Cosines: <i>&radic;(" + b + "<sup>2</sup> + " + c + "<sup>2</sup>-2(" + b + ")(" + c + ")cos(" + A + ")) &asymp; " + a + "</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + b + "(sin(" + A + ")/" + a + ")) = " + B + "&deg;</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + c + "(sin(" + A + ")/" + a + ")) = " + C + "&deg;</i><br /><br />");
		}
		else if (an == 2)
		{ 
			b = lawOfCos2(c,a,B); 
			A = lawOfSin2(a,b,B);
			C = lawOfSin2(c,b,B);
			addOutput("Performed a Law of Cosines: <i>&radic;(" + a + "<sup>2</sup> + " + b + "<sup>2</sup>-2(" + a + ")(" + c + ")cos(" + B + ")) &asymp; " + b + "</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + a + "(sin(" + B + ")/" + b + ")) = " + A + "&deg;</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + c + "(sin(" + B + ")/" + b + ")) = " + C + "&deg;</i><br /><br />");
		}
		else
		{ 
			c = lawOfCos2(b,a,C); 
			B = lawOfSin2(b,c,C);
			A = lawOfSin2(a,c,C);
			addOutput("Performed a Law of Cosines: <i>&radic;(" + b + "<sup>2</sup> + " + a + "<sup>2</sup>-2(" + b + ")(" + a + ")cos(" + C + ")) &asymp; " + c + "</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + b + "(sin(" + C + ")/" + c + ")) &asymp; " + B + "&deg;</i><br />");
			addOutput("Performed a Law of Sines: <i>asin(" + a + "(sin(" + C + ")/" + c + ")) &asymp; " + A + "&deg;</i><br /><br />");
		}
		return {a:a,b:b,c:c,A:A,B:B,C:C,ds:false,ds2:false};
	}
	else
	{
		var kna = 0;
		var kns = 0;
		var pas = 0;
		var paa = 0;
		var una = 0;
		var uns = 0;
		
		var paa2 = 0;
		var una2 = 0;
		var uns2 = 0;
		
		var ds = false;
				
		if (!isNaN(a) && !isNaN(A))
		{
			kns = a;
			kna = A;
		}
		if (!isNaN(b) && !isNaN(B))
		{
			kns = b;
			kna = B;
		}
		if (!isNaN(c) && !isNaN(C))
		{
			kns = c;
			kna = C;
		}
		
		if (!isNaN(a) && isNaN(A)) 
		{
			pas = a;
		}
		if (!isNaN(b) && isNaN(B)) 
		{
			pas = b;
		}
		if (!isNaN(c) && isNaN(C)) 
		{
			pas = c;
		}
		
		var ops = kns;
		var ads = pas;
		var hgt = ads*Math.sin(kna);
		
		var sol = 0;
		
		if (ads < ops)
		{
			sol = 1;
		}
		else if (ops < ads)
		{
			if (kna < 90)
			{
				if (ops == hgt)
				{
					sol = 1;
				}
				else if (ops > hgt)
				{
					sol = 2;
				}
			}
		}
		else 
		{
			if (kna < 90)
			{
				sol = 1;
			}
		}
		addOutput("<br />");
		
		if (sol == 0)
		{
			addOutput("<span class='ylw'>No Solution.</span><br />");
			return {a:a,b:b,c:c,A:A,B:B,C:C};
		}
		else if (sol == 1)
		{
			addOutput("One Solution.<br /><br />");
			paa = lawOfSin2(pas, kns, kna);
			una = 180 - kna - paa;
			uns = lawOfSin1(una, kns, kna);
		}
		else if (sol == 2)
		{
			ds = true;
			addOutput("Two Solutions.<br /><br />");
			paa = lawOfSin2(pas, kns, kna);
			una = 180 - kna - paa;
			uns = lawOfSin1(una, kns, kna);
			
			paa2 = 180 - lawOfSin2(pas, kns, kna);
			una2 = 180 - kna - paa2;
			uns2 = lawOfSin1(una2, kns, kna);
		}
		
		var a2 = 0;
		var b2 = 0;
		var c2 = 0;
		var A2 = 0;
		var B2 = 0;
		var C2 = 0;
		
		if (ds)
		{					
			a2 = a;
			b2 = b;
			c2 = c;
			A2 = A;
			B2 = B;
			C2 = C;
			
			if (!isNaN(a) && isNaN(A))
				A2 = paa2;
			if (!isNaN(b) && isNaN(B))
				B2 = paa2;
			if (!isNaN(c) && isNaN(C))
				C2 = paa2;			

			if (isNaN(a) && isNaN(A))
			{
				a2 = uns2;
				A2 = una2;
			}
			if (isNaN(b) && isNaN(B))
			{
				b2 = uns2;
				B2 = una2;
			}
			if (isNaN(c) && isNaN(C))
			{
				c2 = uns2;
				C2 = una2;
			}
		}		
		
		if (!isNaN(a) && isNaN(A))
			A = paa;
		if (!isNaN(b) && isNaN(B))
			B = paa;
		if (!isNaN(c) && isNaN(C))
			C = paa;			

		if (isNaN(a) && isNaN(A))
		{
			a = uns;
			A = una;
		}
		if (isNaN(b) && isNaN(B))
		{
			b = uns;
			B = una;
		}
		if (isNaN(c) && isNaN(C))
		{
			c = uns;
			C = una;
		}
		
		// los2 return radToDeg(Math.asin((a * Math.sin(degToRad(B)))/b));
		/*
		
			paa = lawOfSin2(pas, kns, kna);
			una = 180 - kna - paa;
			uns = lawOfSin1(una, kns, kna);
			
		*/
		if (sol == 2)
			addOutput("<span class='good'>Solution for 2nd Triangle (Brighter Colors)</span><br /><br />");
		addOutput("Performed a Law of Sines: <i>asin(" + pas + "(sin(" + kna + ")/" + kns + ") &asymp; " + paa + "</i><br />");
		addOutput("<br />All Angles Determined: <p class='in'><i>a</i> &asymp; <i>" + A + "&deg;</i><br /><i>b</i> &asymp; <i>" + B + "&deg;</i><br /><i>c</i> &asymp; <i>" + C + "&deg;</i></p>");
		addOutput("Performed a Law of Sines: <i>sin(" + una + ")/(sin(" + kna + ")/" + kns + ") &asymp; " + paa + "</i><br />");
		// los1 return Math.sin(degToRad(A))/(Math.sin(degToRad(B))/b);
		
		return {a:a,b:b,c:c,A:A,B:B,C:C,ds:ds,ds2:false,a2:a2,b2:b2,c2:c2,A2:A2,B2:B2,C2:C2};
	}
}

function solveComplete(tri)
{
	var a = tri.a;
	var b = tri.b;
	var c = tri.c;
	var A = tri.A;
	var B = tri.B;
	var C = tri.C;
	if (!isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(A) && !isNaN(B) && !isNaN(C))
	{
		A = Math.round(A*1000)/1000;
		B = Math.round(B*1000)/1000;
		C = Math.round(C*1000)/1000;
		a = Math.round(a*1000)/1000;
		b = Math.round(b*1000)/1000;
		c = Math.round(c*1000)/1000;
		if (tri.ds)
		{
			A2 = tri.A2;
			B2 = tri.B2;
			C2 = tri.C2;
			a2 = tri.a2;
			b2 = tri.b2;
			c2 = tri.c2;
			solveComplete({a:a2,b:b2,c:c2,A:A2,B:B2,C:C2,ds2:true});
		}
		if (tri.ds2)
		{
			addOutput("<br /><span class='good'>Triangle Solved</span>:<p class='in'><i style='color:#08f'>a</i> &asymp; <i>" + a + "</i><br /> <i style='color:#880'>b</i> &asymp; <i>" + b + "</i><br /> <i style='color:#280'>c</i> &asymp; <i>" + c + "</i><br /> <i>A</i> &asymp; <i>" + A + "&deg;</i><br /> <i>B</i> &asymp; <i>" + B + "&deg;</i><br /> <i>C</i> &asymp; <i>" + C + "&deg;</i></p>");
		}
		else
		{
			addOutput("<span class='good'>Triangle Solved</span>:<p class='in'><i class='blu'>a</i> &asymp; <i>" + a + "</i><br /> <i class='ylw'>b</i> &asymp; <i>" + b + "</i><br /> <i class='good'>c</i> &asymp; <i>" + c + "</i><br /> <i>A</i> &asymp; <i>" + A + "&deg;</i><br /> <i>B</i> &asymp; <i>" + B + "&deg;</i><br /> <i>C</i> &asymp; <i>" + C + "&deg;</i></p>");	
			addOutput("This work is not copyrighted. All source code is available <a href='source.zip'>here</a>.");
		}
		drawTriangle(tri);
	}
	else 
	{
		addOutput("<br /><span class='bad'>Solve Failed. Your triangle is impossible. Check your input and try again!</span>");
	}
}

function lawOfCos1(a,b,c)
{
	var A = (c*c+b*b-a*a)/(2*b*c);
	if (A >= -1 && A <= 1)
	{
		return radToDeg(Math.acos(A));
	}
	else
	{
		return "Solution Unavailable";
	}
}

function lawOfCos2(a,b,C)
{
	return Math.sqrt(a*a+b*b-2*a*b*Math.cos(degToRad(C)));
}

function lawOfSin1(A,b,B)
{
	return Math.sin(degToRad(A))/(Math.sin(degToRad(B))/b);
}

function lawOfSin2(a,b,B)
{
	return radToDeg(Math.asin((a * Math.sin(degToRad(B)))/b));
}

function degToRad(x)
{
	return x / 180 * Math.PI;
}

function radToDeg(x)
{
	return x / Math.PI * 180;
}

function clearOutput() 
{
	document.getElementById("output").innerHTML = "";
}

function addOutput(x) 
{
	document.getElementById("output").innerHTML += x;
}

document.onkeyup = keyUp;

function keyUp(e)
{
	var key = (window.event) ? event.keyCode : e.keyCode;
	if (key != 9 && key != 116)
	{
		solve();
	}
}

function drawTriangle(tri)
{
	var a = tri.a;
	var b = tri.b;
	var c = tri.c;
	var A = tri.A;
	var B = tri.B;
	var C = tri.C;
	var ds = false;
	if (tri.ds2)
	{
		ds = true;
	}
	if (tri.ds)
	{
		drawTriangle({a:tri.a2,b:tri.b2,c:tri.c2,A:tri.A2,B:tri.B2,C:tri.C2,ds2:true,ds:false});
	}
	var canvas = document.getElementById("triangle");
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		var baseline = 0;
		var leg1 = 0;
		var leg2 = 0;
		var basea = 0;
		var l1a = 0;
		var l2a = 0;
		var stst = new Array();
		if (!ds)
		{
			stst[0] = "#666";
			stst["a"] = "#08f";
			stst["b"] = "#ff0";
			stst["c"] = "#4f0";
		}
		else
		{
			stst[0] = "#33";	
			stst["a"] = "#048";
			stst["b"] = "#880";
			stst["c"] = "#280";
		}
		var drawOrder = "";
		if (a >= b && a >= c)
		{
			baseline = a;
			basea = A;
			leg1 = b;
			l1a = B;
			leg2 = c;
			l2A = C;
			drawOrder = "acb";
		}	
		if (b >= a && b >= c)
		{
			baseline = b;
			basea = B;
			leg1 = c;
			l1a = C;
			leg2 = a;
			l2A = A;
			drawOrder = "bac";
		}
		if (c >= b && c >= a)
		{		
			baseline = c;
			basea = C;
			leg1 = a;
			l1a = A;
			leg2 = b;
			l2A = B;
			drawOrder = "cba";
		}
		leg1 = (leg1/baseline);
		leg2 = (leg2/baseline);
		baseline = 180;
		var np2x = 0;
		var np2y = 0;
		var np1x = 0;
		var np1y = 0;
		np2x = -Math.cos(degToRad(l1a))*180*leg2;
		np2y = -Math.sin(degToRad(l1a))*180*leg2;	
		var ox = 155;
		var oy = (194/2)-(np2y/2);
		var x = ox;
		var y = oy;
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		ctx.strokeStyle = stst[drawOrder.substring(0,1)];
		ctx.moveTo(x,y);
		x += 180;
		ctx.lineTo(x,y);
		ctx.stroke();
		ctx.restore();
		
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.strokeStyle = stst[drawOrder.substring(1,2)];
		x += np2x;
		y += np2y;
		ctx.lineTo(x,y);
		ctx.stroke();
		ctx.restore();
		
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.strokeStyle = stst[drawOrder.substring(2,3)];
		ctx.lineTo(ox,oy);
		ctx.stroke();
		ctx.restore();
	}
}

clearOutput();
addOutput("Once you solve a triangle, data will be displayed here. <span class='good'>Online!</span>");
document.getElementById("a").focus();
