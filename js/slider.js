var slider = {
    swipeData: {
        start: {},
        end: {},
        tracking: false,
        currentWidth: 0,
        currentPage: 0,
        posWidth: '0',
        addnum: 0,
        autoid: 0
    },
    setup: function () {
        // load the tempalte
        let card = document.querySelector('#card-tpl');
        let index = document.querySelector('#index-tpl');
        // first load the bg
        for (let i = 0; i < config.bg.length; i++) {
            card.content.querySelector('img').src = config.bg[i].src;
            card.content.querySelector('p').innerHTML = config.bg[i].title;
            document.getElementById('swipe').appendChild(card.content.cloneNode(true));
        }
        // add extra head and tail
        slider.swipeData.addnum = Math.ceil(config.shownum / 2);
        for (let i = 0; i < slider.swipeData.addnum; i++) {
            // add extra head
            card.content.querySelector('img').src = config.bg[config.bg.length - i - 1].src;
            card.content.querySelector('p').innerHTML = config.bg[config.bg.length - i - 1].title;
            document.getElementById('swipe').insertBefore(card.content.cloneNode(true), document.getElementsByClassName('card-wrapper')[0]);
            // add extra tail
            card.content.querySelector('img').src = config.bg[i].src;
            card.content.querySelector('p').innerHTML = config.bg[i].title;
            document.getElementById('swipe').appendChild(card.content.cloneNode(true));
        }
        // add touch listener
        if (config.touchable) {
            helper.on(document.getElementsByClassName('card-wrapper'), 'touchmove', slider.swipeMove);
            helper.on(document.getElementsByClassName('card-wrapper'), 'touchstart', slider.swipeStart);
            helper.on(document.getElementsByClassName('card-wrapper'), 'touchend', slider.swipeEnd);
        }
        // add mouse listener
        if (config.autoplay) {
            document.getElementById('container').addEventListener('mouseover', slider.clearauto);
            document.getElementById('container').addEventListener('mouseout', slider.autoplay);
        }
        // add index
        if (config.indicator) {
            helper.changeStyle(document.getElementById('index-wrapper'), 'display', 'flex');
            for (let i = 0; i < config.bg.length; i++) {
                document.getElementById('index-wrapper').appendChild(index.content.cloneNode(true));
            }
        }
        // add btn listener
        if (!config.btn) {
            helper.changeStyle(document.getElementById('btn-wrapper'), 'display', 'none');
        } else {
            document.getElementById('container').addEventListener('mouseover', function () {
                helper.addClass(document.getElementById('btn-wrapper'), 'active');
            });
            document.getElementById('container').addEventListener('mouseout', function () {
                helper.removeClass(document.getElementById('btn-wrapper'), 'active');
            });
            document.getElementById('lfb').addEventListener('click', slider.pre);
            document.getElementById('rfb').addEventListener('click', slider.next);
        }
        // slide to starting line
        slider.slide(slider.swipeData.addnum);
    },
    mount: function () {
        let dom = document.getElementsByClassName('card-wrapper')[0];
        let width = helper.getWidth(dom);
        let height = helper.getHeight(dom);
        // set the container's width and height
        document.getElementById('container').style.width = config.shownum * width + 'px';
        document.getElementById('container').style.height = (config.shownum - 1) * config.rate / 2 * height + height + 'px';
        // adjust the position
        document.getElementById('swipe').style.left = width * (config.shownum - 1) / 2 + 'px';
        document.getElementById('swipe').style.top = (config.shownum - 1) * config.rate / 4 * height + 'px';
        // adjust the index
        document.getElementById('index-wrapper').style.width = config.shownum * width + 'px';
    },
    decorate: function () {
        let left = 'eft', right = 'ight';
        let wrappers = document.getElementsByClassName('card-wrapper');
        helper.remainClasses(wrappers, 'card-wrapper');
        helper.addClass(wrappers[slider.swipeData.currentPage], 'now');
        for (let i = 1; i < slider.swipeData.addnum; i++) {
            left = 'l' + left;
            right = 'r' + right;
            helper.addClass(wrappers[slider.swipeData.currentPage - i], left);
            helper.addClass(wrappers[slider.swipeData.currentPage + i], right);
        }
    },
    swipeStart: function (event) {
        document.addEventListener('touchmove', event.preventDefault());
        if (event.type === 'touchstart') {
            if (event.touches.length > 1) {
                slider.swipeData.tracking = false;
                return;
            } else {
                slider.swipeData.tracking = true;
                slider.swipeData.start.t = new Date().getTime();
                slider.swipeData.start.x = event.targetTouches[0].clientX;
                slider.swipeData.start.y = event.targetTouches[0].clientY;
                slider.swipeData.end.x = event.targetTouches[0].clientX;
                slider.swipeData.end.y = event.targetTouches[0].clientY;
            }
        }
    },
    swipeMove: function (event) {
        if (slider.swipeData.tracking) {
            if (event.type === 'touchmove') {
                event.preventDefault();
                slider.swipeData.end.x = event.targetTouches[0].clientX;
                slider.swipeData.end.y = event.targetTouches[0].clientY;
            }
            slider.swipeData.posWidth = -(slider.swipeData.currentWidth) + slider.swipeData.end.x - slider.swipeData.start.x + 'px';
            helper.changeStyle(document.getElementById('swipe'), 'transform', 'translate3D(' + slider.swipeData.posWidth + ',0 ,0)');
        }
    },
    swipeEnd: function (event) {
        slider.swipeData.tracking = false;
        let now = new Date().getTime();
        let deltaTime = now - slider.swipeData.start.t;
        let deltaX = slider.swipeData.end.x - slider.swipeData.start.x;
        let deltaY = slider.swipeData.end.y - slider.swipeData.start.y;
        document.removeEventListener('touchmove', event.preventDefault());
        if (deltaTime > config.deltaTime) {
            slider.slide(slider.swipeData.currentPage);
        } else {
            if (deltaX > config.deltaX) {
                slider.pre();
                return;
            } else if (-deltaX > config.deltaX) {
                slider.next();
                return;
            } else {
                slider.slide(slider.swipeData.currentPage);
                return;
            }
        }
    },
    pre: function () {
        if (slider.swipeData.currentPage >= slider.swipeData.addnum) {
            slider.swipeData.currentPage -= 1;
            slider.slide();
        }
    },
    next: function () {
        if (slider.swipeData.currentPage < slider.swipeData.addnum + config.bg.length) {
            slider.swipeData.currentPage += 1;
            slider.slide();
        }
    },
    slide: function (pagenum) {
        helper.changeStyle(document.getElementById('swipe'), 'transitionDuration', '300ms');
        helper.changeStyles(document.getElementsByClassName('card-wrapper'), 'transitionDuration', '300ms');
        if (pagenum || pagenum === 0) {
            slider.swipeData.currentPage = pagenum;
        }

        let $sliderChildren = document.getElementsByClassName('card-wrapper');
        let offestLeft = $sliderChildren[slider.swipeData.currentPage].offsetLeft;
        slider.swipeData.currentWidth = offestLeft - helper.getStyle($sliderChildren[slider.swipeData.currentPage], 'marginLeft');
        slider.swipeData.posWidth = -slider.swipeData.currentWidth + 'px';

        slider.decorate();

        helper.changeStyle(document.getElementById('swipe'), 'transform', 'translate3D(' + slider.swipeData.posWidth + ',0 ,0)');

        if (slider.swipeData.currentPage === slider.swipeData.addnum - 1) {
            setTimeout(function () {
                slider.rollup();
            }, 300);
        } else if (slider.swipeData.currentPage === slider.swipeData.addnum + config.bg.length) {
            setTimeout(function () {
                slider.rollback();
            }, 300);
        } else {
            slider.changeIndex();
        }
    },
    rollup: function () {
        slider.swipeData.currentPage = slider.swipeData.addnum + config.bg.length - 1;
        helper.changeStyle(document.getElementById('swipe'), 'transitionDuration', '0ms');
        
        let $sliderChildren = document.getElementsByClassName('card-wrapper');
        let offestLeft = $sliderChildren[slider.swipeData.currentPage].offsetLeft - helper.getStyle($sliderChildren[slider.swipeData.currentPage], 'marginLeft');
        slider.swipeData.currentWidth = offestLeft;
        slider.swipeData.posWidth = -slider.swipeData.currentWidth + 'px';

        helper.changeStyle(document.getElementById('swipe'), 'transform', 'translate3D(' + slider.swipeData.posWidth + ',0 ,0)');
        slider.changeIndex();

        helper.changeStyles(document.getElementsByClassName('card-wrapper'), 'transitionDuration', '0ms');
        slider.decorate();
    },
    rollback: function () {
        slider.swipeData.currentPage = slider.swipeData.addnum;
        helper.changeStyle(document.getElementById('swipe'), 'transitionDuration', '0ms');
        let $sliderChildren = document.getElementsByClassName('card-wrapper');
        let offestLeft = $sliderChildren[slider.swipeData.currentPage].offsetLeft - helper.getStyle($sliderChildren[slider.swipeData.currentPage], 'marginLeft');
        slider.swipeData.currentWidth = offestLeft;
        slider.swipeData.posWidth = -slider.swipeData.currentWidth + 'px';

        helper.changeStyle(document.getElementById('swipe'), 'transform', 'translate3D(' + slider.swipeData.posWidth + ',0 ,0)');
        slider.changeIndex();

        helper.changeStyles(document.getElementsByClassName('card-wrapper'), 'transitionDuration', '0ms');
        slider.decorate();
    },
    changeIndex: function () {
        if (config.indicator) {
            helper.removeClasses(document.getElementsByClassName('index'), 'active');
            helper.addClass(document.getElementsByClassName('index')[slider.swipeData.currentPage - slider.swipeData.addnum], 'active');
        }
    },
    autoplay: function () {
        
        slider.autoid = setInterval(function () {
            slider.slide(slider.swipeData.currentPage + 1);
        }, config.autotime);
    },
    clearauto: function () {
        helper.addClass(document.getElementById('btn-wrapper'), 'active');
        clearInterval(slider.autoid);
    }
};

var helper = {
    getStyle: function (obj, attr) {
        if (obj.currentStyle) {
            return parseFloat(obj.currentStyle[attr]);
        } else {
            return parseFloat(window.getComputedStyle(obj, null)[attr]);
        }
    },
    getWidth: function (obj) {
        let width = helper.getStyle(obj, "width");
        let marginLeft = helper.getStyle(obj, "marginLeft");
        let marginRight = helper.getStyle(obj, "marginRight");
        let paddingLeft = helper.getStyle(obj, "paddingLeft");
        let paddingRight = helper.getStyle(obj, "paddingRight");
        let borderRight = helper.getStyle(obj, "borderRightWidth");
        let borderLeft = helper.getStyle(obj, "borderLeftWidth");
        return width + marginLeft + marginRight + paddingLeft + paddingRight + borderLeft + borderRight;
    },
    getHeight: function (obj) {
        let height = helper.getStyle(obj, "height");
        let marginTop = helper.getStyle(obj, "marginTop");
        let marginBottom = helper.getStyle(obj, "marginBottom");
        let paddingTop = helper.getStyle(obj, "paddingTop");
        let paddingBottom = helper.getStyle(obj, "paddingBottom");
        let borderTop = helper.getStyle(obj, "borderTopWidth");
        let borderBottom = helper.getStyle(obj, "borderBottomWidth");
        return height + marginTop + marginBottom + paddingTop + paddingBottom + borderTop + borderBottom;
    },
    hasClass: function (obj, cls) {
        return obj.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
    },
    addClass: function (obj, cls) {
        if (!helper.hasClass(obj, cls)) {
            obj.className += " " + cls;
        }
    },
    removeClass: function (obj, cls) {
        if (helper.hasClass(obj, cls)) {
            var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
            obj.className = obj.className.replace(reg, " ");
        }
    },
    remainClass: function (obj, cls) {
        obj.className = cls;
    },
    addClasses: function (obj, cls) {
        for (let i = 0; i < obj.length; i++) {
            helper.addClass(obj[i], cls);
        }
    },
    removeClasses: function (obj, cls) {
        for (let i = 0; i < obj.length; i++) {
            helper.removeClass(obj[i], cls);
        }
    },
    remainClasses: function (obj, cls) {
        for (let i = 0; i < obj.length; i++) {
            helper.remainClass(obj[i], cls);
        }
    },
    changeStyle: function (obj, attr, res) {
        obj.style[attr] = res
    },
    changeStyles: function (obj, attr, res) {
        for (let i = 0; i < obj.length; i++) {
            helper.changeStyle(obj[i], attr, res);
        }
    },
    on: function (obj, event, method) {
        for (let i = 0; i < obj.length; i++) {
            obj[i].addEventListener(event, method);
        }
    }
};

(function(){
    slider.setup();
    slider.mount();
    if (config.autoplay) {
        slider.autoplay();
    }
})();