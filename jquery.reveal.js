/*
 * jQuery Reveal Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/


(function ($) {
  $('a[data-reveal-id]').live('click', function (event) {
    event.preventDefault();
    var modalLocation = $(this).attr('data-reveal-id');
    $('#' + modalLocation).reveal($(this).data());
  });

  $.fn.reveal = function (options) {
    var defaults = {
      animationSpeed: 300,                    // how fast animtions are
      closeOnBackgroundClick: true,           // if you click background will modal close?
      dismissModalClass: 'close-reveal-modal' // the class of a button or element that will close an open modal
    };
    var options = $.extend({}, defaults, options);

    return this.each(function () {
      var modal    = $(this),
        topMeasure = parseInt(modal.css('top')),
        topOffset  = modal.height() + topMeasure,
        locked     = false,
        modalBg    = $('.reveal-modal-bg');

      if (modalBg.length == 0) {
        modalBg = $('<div class="reveal-modal-bg" />').insertAfter(modal);
        modalBg.fadeTo('fast', 0.8);
      }

      function openAnimation() {
        modalBg.unbind('click.modalEvent');
        modal.find('.' + options.dismissModalClass).unbind('click.modalEvent');
        if (!locked) {
          lockModal();

          modal.css({'top': $(document).scrollTop() - topOffset, 'opacity': 0, 'visibility': 'visible'});
          modalBg.fadeIn(options.animationSpeed / 2);
          modal.delay(options.animationSpeed / 2).animate({
            "top": $(document).scrollTop() + topMeasure + 'px',
            "opacity": 1
          }, options.animationSpeed, unlockModal);

          if($.fn.reveal.stack.length > 0) {
            var newModalBottom = $(document).scrollTop() + topMeasure + modal.height();
            var lastModal = $($.fn.reveal.stack[0]);

            lastModal.delay(options.animationSpeed / 2).animate({
              "top": newModalBottom + topMeasure + 'px',
              "opacity": 0
            }, options.animationSpeed, function () {
              // set it to display: none in case it's hanging off the bottom of
              // the document
              lastModal.hide();
            });
          }

          $.fn.reveal.stack.unshift(modal);
        }

        modal.unbind('reveal:open', openAnimation);
      }
      modal.bind('reveal:open', openAnimation);

      function closeAnimation() {
        if (!locked) {
          lockModal();

          // get rid of the overlay if this is the last modal on the stack
          if($.fn.reveal.stack.length == 1)
            modalBg.delay(options.animationSpeed).fadeOut(options.animationSpeed);

          $.fn.reveal.stack.shift();

          modal.animate({
            "top":  $(document).scrollTop() - topOffset + 'px',
            "opacity": 0
          }, options.animationSpeed / 2, function () {
            modal.css({'top': topMeasure, 'opacity': 1, 'visibility': 'hidden'});
            unlockModal();
          });

          if($.fn.reveal.stack.length > 0) {
            var lastModal = $($.fn.reveal.stack[0]);

            lastModal.show();

            lastModal.animate({
              "top": $(document).scrollTop() + topMeasure + 'px',
              "opacity": 1
            }, options.animationSpeed / 2);
          }
        }
        modal.unbind('reveal:close', closeAnimation);
      }
      modal.bind('reveal:close', closeAnimation);
      modal.trigger('reveal:open');

      var closeButton = modal.find('.' + options.dismissModalClass).bind('click.modalEvent', function () {
        modal.trigger('reveal:close');
      });

      if (options.closeOnBackgroundClick) {
        modalBg.css({"cursor": "pointer"});
        modalBg.bind('click.modalEvent', function () {
          if($.fn.reveal.stack.length > 0)
            $($.fn.reveal.stack[0]).trigger('reveal:close');
        });
      }

      $('body').keyup(function (event) {
        if (event.which === 27) { // 27 is the keycode for the Escape key
          modal.trigger('reveal:close');
        }
      });

      function unlockModal() {
        locked = false;
      }

      function lockModal() {
        locked = true;
      }
    });
  };
  // a global stack of active modals
  $.fn.reveal.stack = [];
})(jQuery);
