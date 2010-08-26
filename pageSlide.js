/*
 * PageSlide jQuery plugin.
 * 
 * # Modification of the Scott Robbin's pageSlide plugin
 * # Check it out at http://github.com/organizations/freshout
 *
*/

(function($) {
    $.fn.pageSlide = function(options) {
        
        var settings = $.extend({
            height: '85%',
            loading: false,
            bookmarkers: true,
            label: "Back to site",
            duration: 'normal',
            direction: 'top',
            opacity: 0.6,
            modal: false,
            collectionSelector: '.page-slide',
            copyUrlImgPath: 'images/copyurl_icon.png', 
            viewOrigImgPath: 'images/ps/vieworiginal_icon.png',
            _identifier: $(this)
        }, options);
        var pageslide_slide_wrap_css = {
            position: 'fixed',
            height: 0,
            top: 0,
            width: '100%',
            zIndex: 999,
            overflow: 'hidden',
            background: '#ffffff'
        };
        var pageslide_body_wrap_css = {
            position: 'relative',
            zIndex: 0,
            top: 0
        };
        var pageslide_blanket_css = {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            opacity: 0,
            backgroundColor: 'black',
            zIndex: 1,
            display: 'none',
            'float': 'left'
        };
        var pageslide_slide_iframe_css = {
            border: 'none',
            width: '100%',
            height: '100%'
        };
        var index = $(settings.collectionSelector).index(this);
        var size = $(settings.collectionSelector).size();
        var current = index;
                
        function _initialize(anchor) {
            if($('#pageslide-body-wrap, #pageslide-content, #pageslide-slide-wrap').size() === 0) {
                var psBodyWrap = $('<div />')
                    .css(pageslide_body_wrap_css)
                    .attr('id', 'pageslide-body-wrap');
                
                $('body > *:not(script)').wrapAll(psBodyWrap);
                
                var psSlideBack = $('<div />')
                    .addClass('pageslide-close-bar')
                    .attr('href', '#');
                if(size > 1 /*&& settings.bookmarkers*/) {
                    psSlideBack.append('<div class="slide-controls"><div><a href="#" class="prev">PREV</a><a href="" class="next">NEXT</a></div></div>');
                }

                var backbutton = '\
                  <a href="#" class="backbutton pageslide-close">\
                    <div class="leftarrow">&nbsp;</div>\
                    <div class="middle">' + settings.label + '</div>\
                    <div class="right">&nbsp;</div>\
                  </a>';
                psSlideBack.append(backbutton);

                var grayButtons = '\
                  <div class="graybuttons">\
                    <div class="left">&nbsp;</div>\
                    <a href="#" id="glueButton" class="copyUrlButton">\
                      <img src="' + settings.copyUrlImgPath + '"/>\
                      <label>Copy URL</label>\
                    </a>\
                    <img class="division" src="/images/ps/ps-graybuttons-division.png" />\
                    <a href="#" class="viewOriginal">\
                      <img src="' + settings.viewOrigImgPath + '" />\
                      <label>View original</label>\
                    </a>\
                    <div class="right">&nbsp;</div>\
                  </div>\
                  <div class="psMessage"></div>';
                psSlideBack.append(grayButtons);

                psSlideBack.append('\
                    <div class="bookmarkers" style="float: right">\
                        <a href="javascript:void(0)" title="Share to Facebook" class="button hide-text share-facebook right" type="button"></a>\
                    </div>');
                var psSlideIframe = $('<iframe />')
                    .attr('id', 'pageslide-iframe')
                    .css(pageslide_slide_iframe_css);

                var psSlideLowbar = '<div class="psLowbar">&nbsp;</div>';
                psSlideBack.append(psSlideLowbar);
                
                var psSlideContent = $('<div style="text-align: center;"/>')
                    .hide()
                    .attr('id', 'pageslide-content')
                    .append(psSlideBack)
                    .append(psSlideIframe);
                
                var psSlideWrap = $('<div />')
                    .css(pageslide_slide_wrap_css)
                    .attr('id', 'pageslide-slide-wrap').append(psSlideContent);
                $('body').append(psSlideWrap);
                
                if($('#pageslide-blanket').size() === 0 && settings.modal === true) {
                    var psSlideBlanket = $('<div class="pageslide-close"/>')
                        .css(pageslide_blanket_css)
                        .attr('id', 'pageslide-blanket');
                    $('body').append(psSlideBlanket);
                    psSlideBlanket.click(function() {
                        return false;
                    });
                }
                
                $(window).resize(function() {
                    $('#pageslide-body-wrap').width($('body').width());
                });
                
                $(anchor).attr('rel', 'pageslide'); 
            }
        }
        
        function _openSlide(elm) {
            if($('#pageslide-slide-wrap').height() != 0) { return false; }
            _showBlanket();
            var direction = {};
            var new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
            if(settings.direction === 'bottom') {
                direction = {
                    bottom: '-' + new_height
                };
                $('#pageslide-slide-wrap').css('top', 0);
            } else {
              direction = {
                  top: new_height
              };
              $('#pageslide-slide-wrap').css('bottom', 0);
            }
            $('body').attr('scrollTop', 0);
            _overflowFixAdd();
            settings.bookmarkers ? $('.bookmarkers').show() : $('.bookmarkers').hide();
            $('#pageslide-slide-wrap').animate({
                height: new_height
            }, settings.duration);
            
            $('#pageslide-body-wrap, #pageslide-slide-wrap').width($('body').width());
            $('#pageslide-body-wrap').animate(direction, settings.duration, function() {
                
                $('body').css('position', 'relative').css('height', $(window).height());
                $('#pageslide-content').css('height', $('#pageslide-slide-wrap').height() - 42).show();
                if(settings.loading) {
                    $('#pageslide-iframe').css('height', 0);
                }
                if($(elm).attr('href') !== $('#pageslide-iframe').attr('src')) {
                    $('#pageslide-iframe').attr('src', elm.href);
                    $('.share-facebook').attr('href', "http://www.facebook.com/sharer.php?u="+encodeURIComponent(elm.href));
                    $(".share-facebook").click(function() {
                        window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(elm.href), 'sharer', 'toolbar=0,status=0,width=626,height=436');
                        return false;
                    });
                }
                    
                $('.viewOriginal').unbind('click').click(function(){
                    window.location = $('#pageslide-iframe').attr('src')
                });

                $('.pageslide-close').unbind('click').click(function(ev) {
                    _closeSlide(ev);
                    $(this).unbind('click');
                    return false;
                });

                $('.next').unbind('click').click(function(){
                    current = (current == size-1) ? 0 : current+1;
                    var url = $(settings.collectionSelector).eq(current).attr('href');
                    $('#pageslide-iframe').attr('src', url);
                    $('.share-facebook').attr('href', "http://www.facebook.com/sharer.php?u="+encodeURIComponent(url))
                    $(".share-facebook").click(function() {
                        window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(url), 'sharer', 'toolbar=0,status=0,width=626,height=436');
                        return false;
                    });
                    return false;
                });
                                
                $('.prev').unbind('click').click(function(){
                    current = (current == 0) ? size-1 : current-1;
                    var url = $(settings.collectionSelector).eq(current).attr('href');
                    $('#pageslide-iframe').attr('src', url);
                    $('.share-facebook').attr('href', "http://www.facebook.com/sharer.php?u="+encodeURIComponent(url))
                    $(".share-facebook").click(function() {
                        window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(url), 'sharer', 'toolbar=0,status=0,width=626,height=436');
                        return false;
                    });
                    
                    return false;
                });
                                
                $(window).resize(function() {
                    new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
                    $('#pageslide-slide-wrap').css('height', new_height);
                    $('#pageslide-content').css('height', $('#pageslide-slide-wrap').height() - 42);
                    $('#pageslide-body-wrap').css('top', new_height);
                });

                loadZeroClipboard('glueButton', function(){
                    $('.psMessage').html('Copied to clipboard!');
                    setTimeout(function(){
                        $('.psMessage').html('&nbsp;');
                    }, 5000);
                }); 
                setZeroClipboardText($('#pageslide-iframe').attr('src'));
            });
        }
        
        function _closeSlide(event) {
            if(event.button != 2 && $('#pageslide-slide-wrap').height() != 0) {
                // if not right click
                $.fn.pageSlideClose(settings);
            }
        }
        
        function _showBlanket() {
            if(settings.modal === true) {
                $('#pageslide-blanket').toggle().animate({
                    opacity: settings.opacity
                }, 'fast', 'linear');
            }
        }
        
        function _overflowFixAdd() {
            $('html, body').css({
                overflowY: 'hidden'
            });
        }
        
        _initialize(this);

        return this.each(function() {
            if(!$(this).hasClass('pageslide-binded')) {
               $(this).bind('click', function() {
                  _openSlide(this);
                  $('#pageslide-slide-wrap').unbind('click').click(function(e) {
                      if(e.target.tagName != "A") { return false; }
                  });
                  if(settings.modal != true && !$(document).hasClass('pageslide-binded')) {
                      $(document).click(function(ev) {
                          if(e.target.tagName != "A") {
                              _closeSlide(ev);
                              return false;
                          }
                          $(this).addClass('pageslide-binded');
                      });
                  }
                  $(this).addClass('pageslide-binded');
                  return false;
              });
            }
        });
    };
})(jQuery);

(function($) {
    $.fn.pageSlideClose = function(options) {
        var settings = $.extend({
            height: '300px',
            duration: 'normal',
            direction: 'top',
            modal: false,
            _identifier: $(this)
        }, options);
        
        function _hideBlanket() {
            if(settings.modal === true && $('#pageslide-blanket').is(':visible')) {
                $('#pageslide-blanket').animate({
                    opacity: 0
                }, 'fast', 'linear', function() {
                    $(this).hide();
                });
            }
        }
        
        function _overflowFixRemove() {
            $('html, body').css({
                overflowY: ''
            });
        }
        _hideBlanket();
        var direction = $('#pageslide-slide-wrap').css('top') != '0px' ? {top: 0} : {bottom: 0};
        $('body').css('height', 'auto');
        $('#pageslide-slide-wrap').animate({
            height: 0
        }, settings.duration, function() {
            $('#pageslide-content').css('height', '0px').hide();
            $('#pageslide-body-wrap, #pageslide-slide-wrap').css({
                top: '0px',
                bottom: '0px',
                width: ''
            });
            $(window).unbind('resize');
            $('#pageslide-iframe').attr('src', 'about:blank');
            _overflowFixRemove();
        });
    };

    $(document).ready(function() {
        $(document).keyup(function(event) {
            if ($("#pageslide-blanket").is(":visible") && event.keyCode == 27) {$(this).pageSlideClose({modal: true});}
        });
    });
})(jQuery);
