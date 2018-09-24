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
    elContentClass: 'disclosure__content',
    customClassAttribute: 'data-adw-class',
    buttonLabelAttribute: 'data-disclosure',
    buttonSelector: '[data-disclosure-btn]',
    contentSelector: '[data-disclosure-content]',
    elStateAttribute: 'data-disclosure-open'
  };

  var A11Ydisclosure = function ( inst, options ) {
    var _options = Object.assign(A11YdisclosureOptions, options);
    var el = inst;
    var button;
    var content;
    var elID;
    var contentID;
    var elCustomClass;
    var expandedState = false;


    var init = function () {
      elID = el.id || util.generateID(_options.baseID);
      el.classList.add(_options.elClass);
      contentID = elID + '_content';

      if ( el.hasAttribute(_options.elStateAttribute) ) {
        expandedState = true;
      }

      button = el.querySelector(_options.buttonSelector) || generateButton();
      content = el.querySelector(_options.contentSelector);

      setupButton();
      setupContent();
    }; // init()


    var generateButton = function () {
      var newBtn = doc.createElement('button');
      newBtn.type = 'button';
      newBtn.textContent = el.getAttribute(_options.buttonLabelAttribute) || 'Hi';
      el.insertBefore(newBtn, el.firstChild);

      button = newBtn;
      return button;
    };


    var setupContent = function () {
      content.classList.add(_options.elContentClass);
      content.id = contentID;

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
      button.setAttribute('aria-expanded', expandedState);
      button.setAttribute('aria-controls', contentID);
      button.classList.add(_options.buttonClass);
      button.disabled = false;
      button.hidden = false;

      button.addEventListener('click', activateWidget, false);
      el.addEventListener('keypress', keyEvents, false);
    }; // setupButton()


    var activateWidget = function ( e ) {
      if ( button.getAttribute('aria-expanded') === 'true' ) {
        button.setAttribute('aria-expanded', 'false')
        content.hidden = true;
        expandedState = false;
      }
      else {
        button.setAttribute('aria-expanded', 'true')
        content.hidden = false;
        expandedState = true;
      }
    }; // activateWidget()


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
          if ( expandedState ) {
            button.setAttribute('aria-expanded', 'false');
            content.hidden = true;
            button.focus();
          }
          break;

        default:
          break;
      }
    } // keyEvents()

    /**
     * on click outside of non-modal disclosure,
     * the disclosure must close.
     *
     * if focus is not on the button or within
     * the disclosure itself, the disclosure
     * must close.
     *
     *
     */

    init.call( this );

    return this;
  }; // A11Ydisclosure()

  w.A11Ydisclosure = A11Ydisclosure;
})( window, document );
