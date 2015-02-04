var Accordion = (function (GLOB) {
	"use strict";
	// Анимация свёртывания панели:
	function collapse(element, ctx) {
		var i       = element.dd.scrollHeight,
			intId   = GLOB.setInterval(
				function () {
					if (i <= 0) {
						element.dd.style.height = "0px";
						GLOB.clearInterval(intId);
                        // Изменяем состояние объекта:                        
                        // Вызываем обработчик события "после свёртывангия панели"
                        ctx.cfg.onAfterCollapse(element);
						return true;
					}
					element.dd.style.height = (i -= ctx.cfg.speed) + "px";
					return true;
				},
				5
			);
        // Вызываем обработчик события "до свёртывангия панели"
        ctx.cfg.onBeforeCollapse(element);
        element.state = 0;
		return true;
	}
	// Анимация развёртывания панели:
	function expand(element, ctx) {
		var i       = 0,
            height  = element.dd.scrollHeight,
			intId   = GLOB.setInterval(
				function () {
					if (i >= height) {
						element.dd.style.height = height + "px";
						GLOB.clearInterval(intId);
                        // Изменяем состояние объекта:
                        
                        // Вызываем обработчик события "после открытия панели"
                        ctx.cfg.onAfterOpen(element);
						return true;
					}
					element.dd.style.height = (i += ctx.cfg.speed) + "px";
					return true;
				},
				5
			);
        // Вызываем обработчик события "до открытия панели"
        ctx.cfg.onBeforeOpen(element);
        element.state = 1;
		return true;
	}
    /**
     * Возвращаемая ф-ция
     * @param HTMLElement element - элемент для создания вкладок,
     * @param Object config - объект конфигурации.
     */
	return function (element, config) {
		return {
            // Объект конфигурации:
			cfg			: {
                // Заранее открытая вкладка:
				openIdx	: 0,
                // Скорость открытия/закрытия
				speed	: 5,
                // Тип события на которое будем реагировать.
				event	: "click",
                // Обработчик вызывается ПЕРЕД ОТКРЫТИЕМ вкладки el-HTMLElement - текущая вкладка
                onBeforeOpen:   function (el) {return true; },
                // Обработчик вызывается ПОСЛЕ ОТКРЫТИЯ вкладки el-HTMLElement - текущая вкладка
                onAfterOpen:    function (el) {return true; },
                // Обработчик вызывается ПЕРЕД ЗАКРЫТИЕМ вкладки el-HTMLElement - текущая вкладка
                onBeforeCollapse:   function (el) {return true; },
                // Обработчик вызывается ПОСЛЕ ЗАКРЫТИЯ вкладки el-HTMLElement - текущая вкладка
                onAfterCollapse:    function (el) {return true; }
			},
			// Метод для "перегона" свойств из объекта - параметра конфигурации во внутренний объект
			option		: function (config) {
				var p;
				for (p in config) {
					// Здесь JSLint будет брехать - игнорим!
					if (this.cfg.hasOwnProperty(p)) {
						this.cfg[p] = typeof config[p] === "undefined" ? this.cfg[p] : config[p];
					}
				}
				return true;
			},
            // Инициализация объекта - вызывается автоматом сразу.
			init	: function (element, config) {
				var prefix	= element.id,
					panes	= element.children,
					length	= panes.length,
					openObj = null,
					ctx = this,
					cur,
					i;
                // Задаём конфигурацию:
				ctx.option(config);
                // Обработчик вынесен в эту ф-цию, что бы не навешивать его внутри цикла:
				function actionHandler(current) {
                    // Вешаем обработчики (помним: событие задаётся в настройках ctx.cfg.event):
					current.dt["on" + ctx.cfg.event] = function () {
						// Если кликнули на новой панельке - Меняем ссылку на текущий объект:
						if (openObj !== current) {
							// Если openObj назначен вообще:	
							if (openObj && openObj.state === 1) {
								openObj.dt.removeAttribute("id");
								collapse(openObj, ctx);
							}
							openObj = current;
							openObj.dt.id = prefix + "-current";
							expand(openObj, ctx);
							return true;
						}
						// Текущий объект в состоянии "ЗАКРЫТ" - Открываем:
						if (current.state === 0) {
							openObj.dt.id = prefix + "-current";
							expand(openObj, ctx);
							return true;
						}
						// Текущий объект в состоянии "ОТКРЫТ" - Закрываем:
						openObj.dt.removeAttribute("id");
						collapse(openObj, ctx);
						return true;
					};
					return true;
				}
                // Пройдёмся по всем четным! вкладкам, развесим на них обработчики:
				for (i = 0; i < length; i += 2) {
                    // Этот объект будет представлять текущее состояние
                    // на момент прохода цикла.
					cur = {
                        // Элемент - заголовок
						dt : panes[i],
                        // Элемент - тело
						dd : panes[i + 1],
                        // Номер вкладки:
                        num : (i / 2) + 1,
                        // Состояние (учитывая настройки ставим закрыто 0/открыто 1)
						state : (i === ((ctx.cfg.openIdx - 1) * 2)) ? 1 : 0
					};
                    // Если сотояние текущего объекта открыто:
					if (cur.state === 1) {
						openObj			= cur;
						openObj.dt.id	= prefix + "-current";
					} else {
						cur.dd.style.height	= "0px";
					}
					cur.dd.style.overflow	= "hidden";
					actionHandler(cur);
				}
				return true;
			}
		}.init(element, config);
	};
}(this));