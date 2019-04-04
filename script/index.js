const fs = require('fs')
const appVersion = require('electron').remote.app.getVersion()

const { webview, addressInput, pickerBtn, runBtn, title } = require('./script/getElements')
const { findFont } = require('./script/fontReplacer')
const { startPicker, stopPicker } = require('./script/handlePicker')
const runHtmlToSketch = require('./script/runHtmlToSketch')
const { showSizeView } = require('./script/handleSizeView')

title.innerText = title.innerText + ' v' + appVersion

runBtn.addEventListener('click', () => {
	runHtmlToSketch()
})

function findFontEvent(e) {
	if (e.newURL.search(/ttf|otf|woff|eot/g) !== -1) {
		findFont(webview)
	}
}

webview.addEventListener('dom-ready', function(e) {
	if (webview.src === 'http://127.0.0.1:4568/_app/resources/Vekter/preview.html?imageBaseURL=http://127.0.0.1:4568&projectURL=http://127.0.0.1:4568') {
		addressInput.value = ''
	}

	const script = fs.readFileSync(__dirname + '/webviewScript/webviewScript.bundle.js', 'utf8')
	webview.executeJavaScript(script)

	stopPicker()

	findFont(webview)
	webview.addEventListener('did-get-response-details', findFontEvent)
})

webview.addEventListener('load-commit', function(e) {
	webview.removeEventListener('did-get-response-details', findFontEvent)
	if (e.isMainFrame) {
		addressInput.value = e.url
	}
})

webview.addEventListener('ipc-message', event => {
	switch (event.channel) {
		case 'picker-picked':
			runBtn.classList.add('SideBar__run-btn--picked-mode')
			break
		case 'window-resize':
		case 'window-scroll':
			stopPicker()
			break
	}
})

webview.addEventListener('new-window', e => {
	webview.src = e.url
})

webview.addEventListener('resize', () => {
	showSizeView()
})

addressInput.onkeydown = function(e) {
	if (e.key === 'Enter') {
		const url = addressInput.value
		addressInput.value = url
		webview.src = url.indexOf('//') === -1 ? 'http://' + url : url
		addressInput.blur()
	}
}

addressInput.onfocus = function() {
	addressInput.select()
}
