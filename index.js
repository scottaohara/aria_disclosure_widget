'use strict';

// add utilities
var util = {
  keyCodes: {
    ENTER: 13,
    SPACE: 32,
    TAB: 9,
    ESC: 27
  },

  generateID: function ( base ) {
    return base + Math.floor(Math.random() * 999);
  }
};


(function ( w, doc, undefined ) {
  /**
   * A11Y Disclosure Widget
   * ...
   *
   * Author: Scott O'Hara
   * Version: 1.0.0
   * License: MIT
   */
  var A11YdisclosureOptions = {
    baseID: 'aDW_',
    elClass: 'disclosure',
    buttonClass: 'disclosure__trigger',
    blockButtonClass: 'disclosure__trigger--block',
    elContentClass: 'disclosure__content',
    customClassAttribute: 'data-disclosure-class',
    buttonLabelAttribute: 'data-disclosure',
    flyoutAttribute: 'data-disclosure-flyout',
    buttonSelector: '[data-disclosure-btn]',
    generateBtnBlockAttribute: 'data-disclosure-btn-block',
    contentSelector: '[data-disclosure-content]',
    elStateAttribute: 'data-disclosure-open',
    manualClassesAttribute: 'data-disclosure-manual-classes',
    hoverActiveAttribute: 'data-disclosure-hover'
  };

  var A11Ydisclosure = function ( inst, options ) {
    var _options = Object.assign(A11YdisclosureOptions, options);
    var el = inst;
    var button;
    var content;
    var elID;
    var contentID;
    var buttonID;
    var elCustomClass;
    var isFlyout = false;
    var isHoverActive = false;
    var expandedState = false;
    var activeEl = false;


    var init = function () {
      elID = el.id || util.generateID(_options.baseID);
      el.classList.add(_options.elClass);
      contentID = elID + '_content';
      buttonID = elID + '_btn';

      button = el.querySelector(_options.buttonSelector) || generateButton();
      content = el.querySelector(_options.contentSelector);

      setupInstance();
      setupButton();
      setupContent();
    }; // init()


    var outsideClick = function () {

      var outsideClickListener = function ( e ) {

        if ( !el.contains(e.target) ) { // or use: event.target.closest(selector) === null
          if ( activeEl ) {
            content.hidden = true;
            button.setAttribute('aria-expanded', 'false');
            removeClickListener();
          }
        }
      }

      doc.addEventListener('click', outsideClickListener);

      var removeClickListener = function () {
        doc.removeEventListener('click', outsideClickListener);
      }
    } // outsideClick()


    var setupInstance = function () {
      if ( el.hasAttribute(_options.elStateAttribute) ) {
        expandedState = true;
      }

      if ( el.hasAttribute(_options.customClassAttribute) ) {
        el.classList.add(el.getAttribute(_options.customClassAttribute));
      }

      if ( el.hasAttribute(_options.hoverActiveAttribute) ) {
        isHoverActive = true;

        el.addEventListener('mouseout', activateWidget, false);
        el.addEventListener('mouseover', mouseOverEvent, false);
      }

      if ( el.hasAttribute(_options.flyoutAttribute) ) {
        isFlyout = true;

        el.addEventListener('focusout', function ( e ) {
          setTimeout( function () {
            if ( !el.contains(doc.activeElement) ) {
              button.setAttribute('aria-expanded', 'false')
              content.hidden = true;
            }
          }, 200);
        });
      }

      el.addEventListener('keypress', keyEvents, false);
    }; // instSetup()


    var generateButton = function () {
      var newBtn = doc.createElement('button');
      newBtn.type = 'button';
      newBtn.textContent = el.getAttribute(_options.buttonLabelAttribute) || 'More info ';
      el.insertBefore(newBtn, el.firstChild);

      button = newBtn;
      return button;
    }; // generateButton()


    var setupContent = function () {
      content.id = contentID;

      if ( !el.hasAttribute(_options.manualClassesAttribute) ) {
        content.classList.add(_options.elContentClass);
      }

      if ( !expandedState ) {
        content.hidden = true;
      }
    }; // setupContent()


    var setupButton = function () {
      if ( button.tagName !== 'BUTTON' ) {
        button.setAttribute('role', 'button');
        button.tabIndex = 0;
        button.removeAttribute('href');
      }

      if ( !el.hasAttribute(_options.manualClassesAttribute) ) {
        if ( button.getAttribute('data-disclosure-btn') === 'block' ) {
          button.classList.add(_options.blockButtonClass);
        }
        button.classList.add(_options.buttonClass);
      }

      button.id = buttonID;
      button.setAttribute('aria-expanded', expandedState);
      button.setAttribute('aria-controls', contentID);
      button.disabled = false;
      button.hidden = false;

      button.addEventListener('click', activateWidget, false);
      button.addEventListener('mousedown', removeMouseOut, false);
    }; // setupButton()


    var activateWidget = function ( e ) {
      if ( button.getAttribute('aria-expanded') === 'true' ) {
        button.setAttribute('aria-expanded', 'false')
        content.hidden = true;
        expandedState = false;
        activeEl = false;
      }
      else {
        button.setAttribute('aria-expanded', 'true');
        content.hidden = false;
        expandedState = true;
        activeEl = el;

        if ( isFlyout ) {
          outsideClick();
          // outsideBlur(button);
        }
      }
    }; // activateWidget()


    var mouseOverEvent = function () {
      activateWidget();
      el.addEventListener('mouseout', activateWidget, false);
    }


    var removeMouseOut = function () {
      if ( isHoverActive ) {
        el.removeEventListener('mouseout', activateWidget);
      }
    }; // removeMouseOut()


    var keyEvents = function ( e ) {
      var keyCode = e.keyCode || e.which;

      switch ( keyCode ) {
        case util.keyCodes.SPACE:
        case util.keyCodes.ENTER:
          // prevents bug w/Firefox where true <button>s
          // well double fire the keyEvent
          if ( button.tagName !== 'BUTTON' ) {
            e.preventDefault();
            activateWidget();
          }
          break;

        case util.keyCodes.ESC:
          if ( expandedState && isFlyout ) {
            button.setAttribute('aria-expanded', 'false');
            content.hidden = true;
            button.focus();
          }
          break;

        default:
          break;
      }
    } // keyEvents()


    init.call( this );

    return this;
  }; // A11Ydisclosure()

  w.A11Ydisclosure = A11Ydisclosure;

  doc.addEventListener('click', function ( e ) {

  });
})( window, document );
