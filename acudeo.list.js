$(...).AcudeoList()

(function($){
	
    $.AcudeoList = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el; 
        
        var countItems = 0;

        // Add a reverse reference to the DOM object
        base.$el.data("AcudeoList", base);
        
        base.init = function(){
            base.options = $.extend({},$.AcudeoList.defaultOptions, options);
			
			for(var action in base.options.actions) {
				if(base.options.actions[action] == 'disabled') {
					jQuery.data($(".btn-"+action, base.$el).setDisabled().get(0), "disabled", true);
				} else if(base.options.actions[action] == 'hidden') {
					$(".btn-"+action, base.$el).hide();					
				}
			}
			if(base.options.sortable) {
 			  $(".clist-body", base.$el).sortable().bind('sortstop', function(event, ui) {
					if(base.options.sortable.stop) {
						base.options.sortable.stop.call(this, event, ui);
					}
			  }); 			  
			}
			$(".clist-body", base.$el).bind('click', {base:base}, function(event){
				$this = $(this);
				if($this.isDisabled()) return false;
				var base = event.data.base;

				base.deselectAllItems();
				$origEl = $(event.target);
				if($origEl.attr("id")) {
					$origEl.addClass('selected');
				} else {
					return;
				}
				$(".btn-modify,.btn-remove,.btn-cancel", base.$el).setActive();
				$(".btn-moveup,.btn-movedown", base.$el).setDisabled();	
					
				currIndex = parseInt($origEl.attr("id").split("_")[1]);			
				if(currIndex > 0) {
					$(".btn-moveup", base.$el).setActive();
				} 
				if(currIndex != countItems - 1) {
					$(".btn-movedown", base.$el).setActive();					
				}
			});
			$(".clist-btns", base.$el).bind('click', {base:base}, function(event){
				var $this = $(this);
				if($this.isDisabled()) return false;
				
				var base = event.data.base;
				var className = $this.attr("class");		
				if(className.indexOf("add") != -1) {
					addItem.call(this, base);
				} else if(className.indexOf("cancel") != -1) {
					cancelItem.call(this, base);			
				} else if(className.indexOf("store") != -1) {
					storeItem.call(this, base);			
				} else if(className.indexOf("modify") != -1) {
					modifyItem.call(this, base);			
				} else if(className.indexOf("remove") != -1) {
					removeItem.call(this, base);			
				} else if(className.indexOf("moveup") != -1) {
					moveupItem.call(this, base);			
				} else if(className.indexOf("movedown") != -1) {
					movedownItem.call(this, base);			
				}
			});
        };       
        base.init();
        
        //Event handlers
		addItem = function(base) {
			$(".btn-modify,.btn-remove,.btn-add", base.$el).setDisabled();
			base.deselectAllItems();
			base.disableList();
			
			if(typeof base.options.handlers['add'] != 'undefined') {
				base.options.handlers['add'].call(this, base);
			}
		};
		cancelItem = function(base) {
			base.deselectAllItems();
			base.enableList();					
			$(".btn-add", base.$el).setActive();
			$(".btn-modify,.btn-remove", base.$el).setDisabled();

			if(typeof base.options.handlers['cancel'] != 'undefined') {
				base.options.handlers['cancel'].call(this, base);
			}	
		};
		storeItem = function(base) {
			$(".btn-add", base.$el).setActive();
			$(".btn-modify,.btn-remove", base.$el).setDisabled();				

			if(typeof base.options.handlers['store'] != 'undefined') {
				base.options.handlers['store'].call(this, base);
			}
			base.enableList();
		};
		modifyItem = function(base) {
			$(".btn-add,.btn-modify,.btn-remove", base.$el).setDisabled();			
			base.disableList();
			if(typeof base.options.handlers['modify'] != 'undefined') {
				base.options.handlers['modify'].call(this, base);
			}
		};
		removeItem = function(base) {
			$(".btn-modify,.btn-remove", base.$el).setDisabled();
			$(".btn-add", base.$el).setActive();						

			if(typeof base.options.handlers['remove'] != 'undefined') {
				base.options.handlers['remove'].call(this, base);
			}
		};		
		moveupItem = function(base) {
			if(typeof base.options.handlers['moveup'] != 'undefined') {
				base.options.handlers['moveup'].call(this, base);
			}
			if(base.getSelectedItemIndex() == 0) {
				$(this).setDisabled();
			}
			$(".btn-movedown", base.$el).setActive();
		};
		movedownItem = function(base) {
			if(typeof base.options.handlers['movedown'] != 'undefined') {
				base.options.handlers['movedown'].call(this, base);
			}
			if(base.getSelectedItemIndex() == countItems - 1) {
				$(this).setDisabled();
			}			
			$(".btn-moveup", base.$el).setActive();				
		};				
		//public methods
		base.deselectAllItems = function() {
			$(".clist-body li", base.$el).removeClass("selected");		
		};
		base.disableList = function() {
			$(".clist-body", base.$el).addClass("disabled");			
		};
		base.enableList = function() {
			$(".clist-body", base.$el).removeClass("disabled");			
		};
						
		base.buildList = function(list) {
			var $listBody = $(".clist-body", base.$el);
			$listBody.empty();
			var html = '';
			countItems = 0;
			for(var i in list) {
				extraClass = "";
				
				if(typeof list[i] != "string") {
					display = list[i].shift();
					extraClass = " " + list[i].shift();
				} else {
					display = list[i];
				}
				
				html += '<li class="clist-item' + extraClass + '" id="item_'+i+'">'+display+'</li>';
				countItems++;
			}

			if(base.options.scrollable && list.length >= base.options.size) {
				$listBody.css({
					overflow:'scroll',
					height: base.options.size*14
				});
			}
			
			$listBody.append(html);
			if(base.options.sortable) {
				$listBody.sortable('refresh');				
			}
		};
		base.getSelectedItemIndex = function() {
			return parseInt($(".clist-body .selected", base.$el).attr('id').split("_")[1]);		
		};
		base.isEmpty = function() {
			return $(".clist-body li", base.$el).length == 0;		
		};
		base.emptyList = function() {
			$(".clist-body", base.$el).empty();		
		};
		base.alwaysDisable = function(action, flag) {
			jQuery.data($(".btn-"+action, base.$el).get(0), "disabled", flag);
		};
		base.getListOrder = function() {
		  var list = $(".clist-body li", base.$el);
		  var listIDs = [];
		  for(var i = 0; i < list.length; i ++) {
		    if($(list[i]).text() != ""){
		      listIDs.push($(list[i]).attr("id").split("_")[1]);
		    }
		  }
		  return listIDs;
		};
		base.selectItem = function(index) {
			$(".clist-body #item_"+index, base.$el).addClass("selected");		
		};		
    }
	
    $.AcudeoList.defaultOptions = {
    	size:5,
    	scrollable: true,
    	actions: {},
    	sortable:false
    }

    $.fn.acudeoList = function(options){
        return this.each(function(){
            (new $.AcudeoList(this, options));
        });
    }
    $.fn.setActive = function(){
		return this.each(function(){
			if(jQuery.data(this, "disabled")) {
				return false;
			}
			$(this).removeClass("disabled").addClass("active");
		});	
    };    
	$.fn.setDisabled = function() {
		return this.each(function(){
			$(this).removeClass("active").addClass("disabled");
		});
	};
	$.fn.isDisabled = function() {
			return $(this).hasClass("disabled");			
	};		    
    // This function breaks the chain, but returns
    // the AcudeoList if it has been attached to the object.
    $.fn.getAcudeoList = function(){
        return this.data("AcudeoList");
    }
	
})(jQuery);