var activeCaseloadId = document.getElementById('active-caseload').value
var userId = document.getElementById('user-id').value
var googleTagManagerEnvironment = document.getElementById('google-tag-manager-env').value
var googleTagManagerContainerId = document.getElementById('google-tag-manager-container').value

dataLayer = [{ activeCaseloadId, userId }]

//Google Tag Manager
;(function (w, d, s, l, i) {
  w[l] = w[l] || []
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : ''
  j.async = true
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + googleTagManagerEnvironment
  f.parentNode.insertBefore(j, f)
})(window, document, 'script', 'dataLayer', googleTagManagerContainerId)

//End Google Tag Manager
