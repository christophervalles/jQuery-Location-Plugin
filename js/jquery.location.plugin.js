(function($) {
    $.locationWidget = function(element, options) {
        var defaults = {
            resultCanvas: '#location-results',
            resultCanvasId: 'location-results',
            resultList: '#location-suggest',
            resultListId: 'location-suggest',
            searchInput: '',
            searchButton: '',
            yahooApiKey: '',
            jsonDataField: '#location_data',
            jsonDataFieldId: 'location_data',
            locale: 'en'
        }

        var texts = {
            resultsHint: 'Choose the correct location below...'
        }

        var searchInProgress = false;

        var plugin = this;

        plugin.settings = {}
        plugin.translations = {}

        var $element = $(element),
             element = element;

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.translations = $.extend({}, texts, options);
            
            //Register the templates
            $.template('noResults', 'No results for <strong>${SearchTerm}</strong>');

            //Prepare the hidden field
            var jsonField = $('<input></input>').attr('type', 'hidden').attr('name', plugin.settings.jsonDataFieldId).attr('id', plugin.settings.jsonDataFieldId);
            $(plugin.settings.searchInput).after(jsonField);
            
            //Prepare the UI
            var div = $('<div></div>').addClass('location-results').attr('id', plugin.settings.resultCanvasId);
            var header = $('<p></p>').html(plugin.translations.resultsHint);
            var ul = $('<ul></ul>').attr('id', plugin.settings.resultListId);
            $(plugin.settings.searchInput).parent().append(div.append(header).append(ul));
            $(plugin.settings.resultCanvas).hide();
            
            //Avoid submit the form when enter key pressed
            if($(plugin.settings.searchInput).length > 0){
                $(plugin.settings.searchInput).bind('keypress', function(event){
                    if(event.which == 13){
                        event.preventDefault();
                        if($(plugin.settings.searchInput).val().length > 0){
                            geocode();
                        }
                    }
                });
            }
            
            //Bind the search
            if($(plugin.settings.searchButton).length > 0){
                $(plugin.settings.searchButton).bind('click', function(e){
                    if($(plugin.settings.jsonDataField).val().length == 0 && $(plugin.settings.searchInput).val().length > 0){
                        geocode();
                    }else{
                        if($(plugin.settings.searchInput).hasClass('edited') && $(plugin.settings.searchInput).val().length > 0){
                            geocode();
                        }
                    }
                });
            }
            
            //Bind the blur event
            if($(plugin.settings.searchInput).length > 0){
                $(plugin.settings.searchInput).bind('blur', function(){
                    if($(plugin.settings.jsonDataField).val().length == 0 && $(plugin.settings.searchInput).val().length > 0){
                        geocode();
                    }else{
                        if($(plugin.settings.searchInput).hasClass('edited') && $(plugin.settings.searchInput).val().length > 0){
                            geocode();
                        }
                    }
                });
                
                $(plugin.settings.searchInput).bind('change', function(){
                    $(plugin.settings.searchInput).addClass('edited');
                });
            }
        }

        var geocode = function() {
            if(plugin.searchInProgess){
                return false;
            }
            
            $(plugin.settings.searchInput).css('background', '#fff url(images/spinner.gif) 98% 50% no-repeat');
            
            var url = 'http://where.yahooapis.com/v1/places$and(.q(' + escape($(plugin.settings.searchInput).val()) + '),.type(7));count=0?format=json&lang=' + plugin.settings.locale + '&appid=' + plugin.settings.yahooApiKey;

            $.getJSON(url, function(data){
                if(data.places.total > 0){
                    $(plugin.settings.searchInput).attr('readonly', 'readonly');
                    
                    $(plugin.settings.resultList).html('');
                    $(data.places.place).each(function(i, e){
                        var name = e.name;
                        if(e.admin1 != e.name){
                            name += ', ' + e.admin1;
                        }
                        
                        name += ', ' + e.country;
                        
                        $(plugin.settings.resultList).append($('<li></li>').append($('<a></a>').attr('href' , '#').html(name)).bind('click', function(event){
                            event.preventDefault();
                            $(plugin.settings.jsonDataField).val(JSON.stringify(e));
                            $(plugin.settings.searchInput).val($(this).children().html());
                            $(plugin.settings.searchInput).removeClass('edited');
                            $(plugin.settings.searchInput).removeAttr('readonly');
                            $(plugin.settings.searchInput).blur();

                            $(plugin.settings.resultCanvas).hide();
                            
                            plugin.searchInProgess = false;
                        }));
                    });
                    
                    $(plugin.settings.resultCanvas + ' p').html(plugin.translations.resultsHint).removeClass('noresults');
                    $(plugin.settings.resultList).show();
                    
                    plugin.searchInProgess = true;
                }else{
                    $(plugin.settings.resultCanvas + ' p').html($.tmpl('noResults', {SearchTerm: $(plugin.settings.searchInput).val()} )).addClass('noresults');
                    $(plugin.settings.resultList).hide();
                    
                    $(plugin.settings.searchInput).removeClass('edited');
                    
                    plugin.searchInProgess = false;
                }
                
                $(plugin.settings.searchInput).removeAttr('style');
                $(plugin.settings.resultCanvas).show();
            });
        }

        plugin.init();
    }

    $.fn.locationWidget = function(options) {
        if (undefined == $(this).data('locationWidget')) {
            var plugin = new $.locationWidget(this, options);
            $(this).data('locationWidget', plugin);
        }
    }
})(jQuery)