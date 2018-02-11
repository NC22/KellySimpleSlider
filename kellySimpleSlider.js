function KellySimpleSlider(cfg) {

    var input = false;
    var track = false;
    var btn = false;
    var fill = false;
    
    var btnBounds = false;
    var trackBounds = false;
    var fillBounds = false;
    
    var currentClass = 'slider';
    
    var events = {};
    
    var handler = this;
    
    var range = {from : 1000, to : 5000};
    var step = 1;
    
    var userEvents = {};
    
    var value = 0;
    
    function construct(cfg) {
        
        if (!cfg.input) {            
            console.log('input is empty')
            return false;            
        }
        
        if (!handler.updateConfig(cfg)) {            
            console.log('config update fail, check input')
            return false;            
        }
        
        track = document.createElement('div');        
        btn = document.createElement('div');
        fill = document.createElement('div');        
        
        handler.addEventListner(input, "keyup", function (e) {
            
            handler.setValue(parseFloat(this.value), true);
        }, 'input_change_');   
        
        input.parentNode.insertBefore(track, input);  
        
        handler.setClass(currentClass);
        
        track.appendChild(fill);
        track.appendChild(btn);
        
        track.onclick = function(e) {
            handler.updateBounds();
            handler.updateByPos(e);
            return false;
        }
        
        handler.updateBounds();
              
        
        handler.setValue(value);
        
        btn.onmousedown = function() {
            handler.dragStart();
            return false;
        }
                
        setTimeout(function() { handler.enableTransition(); }, 500); // prevent animation on create
    } 
    
    this.updateBounds = function() {
    
        trackBounds = track.getBoundingClientRect();
        btnBounds = btn.getBoundingClientRect();
        fillBounds = fill.getBoundingClientRect();
        
        btn.style.top = '-' + (Math.floor(btnBounds.height / 2) - Math.floor(trackBounds.height / 2)) + 'px';         
        fill.style.top = '-' + (Math.floor(fillBounds.height / 2) - Math.floor(trackBounds.height / 2)) + 'px';
        
        btnBounds.halfWidth = Math.floor(btnBounds.width / 2);  
    }
    
    this.updateConfig = function(cfg) {
        if (cfg.events) {
            userEvents = cfg.events;
        }   

        if (cfg.from) {
            range.from = cfg.from;
        }
        
        if (cfg.to) {
            range.to = cfg.to;
        }
        
        if (cfg.value) {
            value = cfg.value;
        } else {
            value = range.from;
        }          

        if (cfg.input) {
            if (typeof cfg.input == 'string') {
                input = document.getElementById(cfg.input);        
            } else {
                input = cfg.input;
            }
            
            if (!input) return false;
        }
        
        if (!cfg.inputVisible) {        
            input.style.height = '0px';
            input.style.visibility = 'hidden';
        } 
        
        if (cfg.className) {
            handler.setClass(cfg.className);
        }
        
        return true;
    }
    
    this.setClass = function(className) {
        className = className.trim();
        
        if (!className) return false;
        
        currentClass = className;
        track.className = currentClass + '-track';
        btn.className = currentClass + '-btn';
        fill.className = currentClass + '-fill';
    }
    
    function getInput() {
        return input;
    }
    
    // returns global coordinats positions
    
    function getScrollLeft() {
        return document.body.scrollLeft + document.documentElement.scrollLeft;
    }
    
    function getScrollTop() {
        return document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    function getTrackLeft() {
        return trackBounds.left + getScrollLeft();
    }
    
    function getEventDot(e) {
        e = e || window.event;
        var x, y;
        var scrollX = getScrollLeft();
        var scrollY = getScrollTop();

        if (e.touches) {
            x = e.touches[0].clientX + scrollX;
            y = e.touches[0].clientY + scrollY;
        } else {
            // e.pageX e.pageY e.x e.y bad for cross-browser
            x = e.clientX + scrollX;
            y = e.clientY + scrollY;
        }

        return {x: x, y: y};
    }
    
    this.getValue = function() {
        return value;
    }
    
    //local coordinats
    
    function updateBtnByX(pos) {
        // console.log(pos + ' | ' + trackBounds.width + ' \ ' + (getTrackLeft() + trackBounds.width));
        if (pos >= trackBounds.width) {
            btn.style.left = (trackBounds.width - btnBounds.halfWidth) + 'px';
            pos = trackBounds.width;
        } else if (pos <= 0) { 
            btn.style.left = '-' + btnBounds.halfWidth + 'px';
            pos = 0;
        } else {
            btn.style.left = (pos - btnBounds.halfWidth )+ 'px';
        }
        
        fill.style.width = pos + 'px';
        
        return pos;
    }
    
    this.setValue = function(val, byInput) {
        
        if (!val) val = 0;
        console.log('new val ' + val)
        
        if (val <= range.from) val = range.from;
        if (val >= range.to) val = range.to;
        
        val = Math.round(val / step) * step;
        
        var rangeTotal = range.to - range.from;
        var percent = (val - range.from) / (rangeTotal / 100); // value in percent from range
        
        var pxPerPercent = (trackBounds.width / 100);
        
        console.log(val  + ' | ' +  percent);
        updateBtnByX(Math.floor(percent * pxPerPercent));
        
        value = val;
        if (!byInput) input.value = value;
                
        if (userEvents.onChange) userEvents.onChange(handler);
    }
    
    this.updateByPos = function(e) {
    
        var pos = getEventDot(e);        
        pos.x -= getTrackLeft(); // get coordinate relative to element (local coordinats)
        
        var pxValue = updateBtnByX(pos.x);       
        
        var pxTotal = trackBounds.width;
        var percent = pxValue / (pxTotal / 100);
                
        var rangeTotal = range.to - range.from;
        
        value = percent * (rangeTotal / 100); // get value from percent eqvivalent
        value = Math.round(value / step) * step; 
        value = range.from + value;
        
        console.log(pxValue + ' | ' + pxTotal + ' | ' + percent + '%' + ' | ' + rangeTotal + ' | ' + value);
        //console.log(value)        
        
        handler.setValue(value);
    } 
    
    this.dragStart = function() {
        
        handler.disableTransition();
        drag = true;
        
        handler.updateBounds();
        
        handler.addEventListner(document.body, "mousemove", function (e) {
            handler.updateByPos(e);
        }, 'v1_drag_');
        handler.addEventListner(document.body, "mouseup", function (e) {
            handler.dragEnd(e);
        }, 'v1_drag_');
    }
    
    this.dragEnd = function(e) {
        handler.enableTransition();
        drag = false;
        handler.removeEventListener(document.body, "mousemove", 'v1_drag_');
        handler.removeEventListener(document.body, "mouseup", 'v1_drag_');
        
        handler.setValue(value);
    }
    
    this.getInput = function() {
        return input;
    }
    
    this.addEventListner = function(object, event, callback, prefix) {
    
        if (typeof object !== 'object') {
            object = document.getElementById(object);
        }

        if (!object)
            return false;
        if (!prefix)
            prefix = '';

        events[prefix + event] = callback;

        if (!object.addEventListener) {
            object.attachEvent('on' + event, events[prefix + event]);
        } else {
            object.addEventListener(event, events[prefix + event]);
        }

        return true;
    }

    this.removeEventListener = function(object, event, prefix) {
        if (typeof object !== 'object') {
            object = document.getElementById(object);
        }

        // console.log('remove :  : ' + Object.keys(events).length);
        if (!object)
            return false;
        if (!prefix)
            prefix = '';

        if (!events[prefix + event])
            return false;

        if (!object.removeEventListener) {
            object.detachEvent('on' + event, events[prefix + event]);
        } else {
            object.removeEventListener(event, events[prefix + event]);
        }

        events[prefix + event] = null;
        return true;
    }

    this.disableTransition = function() {
        fill.style.transition = 'none';
        btn.style.transition = 'none';
    }
    
    this.enableTransition = function() {
        fill.style.transition = 'width 0.3s';
        btn.style.transition = 'left 0.3s';
    }
    
    construct(cfg);
}

KellySlider.defaultStyle = false;
KellySlider.loadDefaultCss = function(name) {
     
    if (KellySlider.defaultStyle) return true;
    
    if (!name) name = 'slider';
    
    var css = "." + name + "-track {\
        width: 100%;\
        height: 22px;\
        /*border: 1px solid rgba(168, 168, 168, 0.85);*/\
        position: relative;\
        border-radius: 12px;\
        background: rgb(253, 253, 253);\
        box-shadow: inset 0px 0px 9px 0px rgba(89, 89, 89, 0.16);\
    }\
    \
    ." + name + "-btn {\
        position: absolute;\
        left: 0px;\
        top: 0px;\
        height: 32px;\
        width: 32px;\
        border-radius: 16px;\
        background: rgb(255, 112, 29);\
        z-index: 2;\
        /*border: 1px solid rgba(134, 134, 134, 0.14);*/\
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);\
        cursor : pointer;\
    }\
    \
    ." + name + "-fill {\
        background: rgba(255, 91, 29, 0.49);\
        /*background: linear-gradient(to right, rgb(104, 201, 107) 0%, rgb(151, 171, 45) 75%, rgba(117,137,12,1) 100%);*/\
        position: absolute;\
        left: 0px;\
        top: 0px;\
        height: 22px;\
        width: 100px;\
        z-index: 1;\
        border-radius : 12px;\
    }\ ";    
    
    var head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    style.type = 'text/css';
    
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    } 
    
    KellySlider.defaultStyle = style;
    head.appendChild(style);
    return true;
}
    
