void function () {
	'use strict'

	var selSettingMainCol = '#site-container div.columns div.column.three-fourths'
	var clsPaneInner = 'boxed-group-inner'
	var selSettingPaneInner = selSettingMainCol + ' > .boxed-group > .' + clsPaneInner
	var clsTabContent = 'tab-content'
	var clsSelected = 'selected'
	var clsTabContentSelected = clsTabContent + '-' + clsSelected
	//var selTabItem = selSettingMainCol + ' > div.tabnav > nav.tabnav-tabs > a'

	var css = `
		${selSettingMainCol} { visibility: hidden; }
		${selSettingPaneInner} {
			padding-top: 10px;
			min-height: 400px;
		}
		/* tab */
		.${clsTabContent} {
			display: none;
			margin: 30px 20px;
		}
		.${clsTabContent}.${clsTabContentSelected} { display: block; }

		/* form */
		.${clsTabContent} form {

		}
		.${clsTabContent} form div.act {
			margin-top: 30px;
		}
		.${clsTabContent} form div.act .btn:first-child {
			width: 80px;
			text-align: center;
		}

		/* mod list */
		ul#omg-mod-list {
			/*margin-left: 1em;*/
			list-style: none;
		}
		ul#omg-mod-list > li {
			margin-bottom: 20px;
		}
		ul#omg-mod-list > li label b {
			font-size: 14px;
			cursor: pointer;
			text-transform: capitalize;  /* temp */
		}
		ul#omg-mod-list > li div.descr {
			margin-top: 5px;
		}
	`
	var htmlPane = `
		<div class="boxed-group">
			<h3>${app.OMG}</h3>
			<div class="${clsPaneInner}"></div>
		</div>
	`
	var htmlTab = `
		<div class="tabnav">
			<nav class="tabnav-tabs">
				<a class="tabnav-tab ${clsSelected}" href="#tab=mod" data-action="switch-tab">Modules and options</a>
				<a class="tabnav-tab" href="#tab=about" data-action="switch-tab">About</a>
			</nav>
		</div>
	`
	var htmlTabContentMod = `
		<div class="${clsTabContent} ${clsTabContentSelected}" data-tab-name="mod">
			<!--<h4>Check to enable modules you want:</h4>-->
			<form class="form-checkbox">
				<div class="act">
					<a role="button" class="btn btn-primary disabled" href="#omg-config-save" data-action>Save</a>
					<!--<a role="button" class="btn" href="#omg-config-cancel" data-action>Cancel</a>-->
				</div>
			</form>
		</div>
	`
	var htmlTabContentAbout = `
		<div class="${clsTabContent}" data-tab-name="about">
			<h4>Author</h4>
			<p class="form-checkbox"><a href="/cssmagic" target="_blank"><b>@cssmagic</b></a> - Designer and developer.</p>
			<h4>Open source libraries</h4>
			<ul class="form-checkbox" style="margin-left: 1em;">
				<li>jQuery</li>
				<li>Underscore</li>
				<li>Action</li>
			</ul>
			<h4>License</h4>
			<p class="form-checkbox">MIT.</p>
			<hr class="bleed-flush">
			<h4>Donate</h4>
			<p class="form-checkbox">
				<a role="button" class="btn btn-sm btn-primary" href="http://www.cssmagic.net/blog/donate" target="_blank">Donate proudly!</a>
			</p>
		</div>
	`
	var tmplModList = `
		<ul id="omg-mod-list">
			<% _.each(data, function (mod) { %>
			<li>
				<label>
					<input name="<%= mod.name %>" type="checkbox" value="1" disabled>
					<b><%= mod.name %></b>
				</label>
				<div class="descr">
					<%= mod.description || '' %>
				</div>
			</li>
			<% }) %>
		</ul>
	`

	// ui
	var tab = {
		isReady: false,
		init: function () {
			if (this.isReady) return
			this.isReady = true
			action.add({
				'switch-tab': function () {
					// handle tab
					var $target = $(this)
					if ($target.hasClass(clsSelected)) return
					$target
						.addClass(clsSelected)
						.siblings('.' + clsSelected).removeClass(clsSelected)
					// handle tab content
					var tabName = $target.attr('href').split('#tab=')[1]
					if (!tabName) return
					var $content = $(`div[data-tab-name="${tabName}"]`)
					if ($content.hasClass(clsTabContentSelected)) return
					$content
						.addClass(clsTabContentSelected)
						.siblings('.' + clsTabContentSelected).removeClass(clsTabContentSelected)
				},
			})
		},
	}

	// fn
	var mod = {
		//isReady: false,
		init: function () {
			//if (this.isReady) return
			//this.isReady = true
			this._getElem()
			this._initPane()
			this._initModList()
			this._bind()
			this.applyConfig()
			this._showSettingCol()
		},
		_getElem: function () {
			this.$settingCol = $(selSettingMainCol)
			this.$settingPane = $(htmlPane)
			this.$settingPaneInner = this.$settingPane.children('.' + clsPaneInner)
			this.$tab = $(htmlTab)
			this.$tabContentMod = $(htmlTabContentMod)
			this.$formConfig = this.$tabContentMod.children('form')
			//this.$modList = this.$formConfig.children('ul')
		},
		_bind: function () {
			var _ns = this
			action.add({
				'omg-config-save': function () {
					_ns.configSave()
				},
				//'omg-config-cancel': function () {
				//	_ns.configCancel()
				//},
			})
			this.$formConfig.on('submit', function (ev) {
				ev.preventDefault()
				_ns.configSave()
			})
		},
		_initPane: function () {
			this.$settingCol.empty().append(this.$settingPane)
			this.$settingPaneInner.append(this.$tab)
			this.$settingPaneInner.append(htmlTabContentAbout).append(this.$tabContentMod)
		},
		_initModList: function () {
			var extModules = app.modules
			template.add('mod-list', tmplModList)
			var html = template.render('mod-list', extModules)
			this.$formConfig.prepend(html)
		},
		_showSettingCol: function () {
			this.$settingCol.css('visibility', 'visible')
			this.$formConfig.find('a.btn').removeClass('disabled')
			this.$formConfig.find('input[type=checkbox]').prop('disabled', false)
		},
		applyConfig: function () {
			var config = app.readConfig()
			//console.log(config)
			var cfgModules = config.modules || {}
			//var cfgModOpts = config.modOptions || {}
			if (_.isObject(cfgModules)) {
				_.each(cfgModules, function (value, modName) {
					var $input = $(`input[name="${modName}"]`).prop('disabled', false)
					if (parseInt(value, 10)) $input.prop('checked', true)
				})
			}
		},

		configSave: function () {
			var data = this.$formConfig.serializeArray()
			// transform data
			// [{name: 'mod_name', value: 1}, {...}] ----> {'mod_name': 1, ...}
			var config = app.readConfig()
			var modules = {}
			_.each(data, function (item) {
				if (parseInt(item.value, 10) === 1 && item.name) {
					modules[item.name] = 1
				}
			})
			config.modules = modules
			//console.log(config)
			app.writeConfig(config)
			alert('\nConfig saved!\n\nRefreshing...')
			location.reload()
		},
		//configCancel: function () {
		//	location.reload()
		//},
	}

	defineModule({
		name: 'ui-setting-pane',
		internal: true,
		urlTypeMatches: [
			'github/setting/omg',
		],
		domMatches: [
			selSettingMainCol,
			//selTabItem,
		],

		// style
		css: css,

		// init entrance
		documentStart: function () {
			document.title = app.OMG + ' settings'
		},
		documentEnd: function () {
			tab.init()
			mod.init()
		},

		// msg
		i18n: {
			en: {
				module_name: 'Sample Module',
			},
			zh: {
				module_name: '示例模块',
			},
		}
	})
}()
