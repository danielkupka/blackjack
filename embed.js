function embed() {
	let x = `
		<iframe src="https://danielkupka.github.io/blackjack/frame.html" style="height:800px;width:800px;border:0px;" title="Embeded Game"></iframe>
	`
	copyElementText(x);
	const embedId = document.getElementById("embedding");
	embedId.classList.remove("hidden");
}

function copyElementText(txt) {
    const elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = txt;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
}
