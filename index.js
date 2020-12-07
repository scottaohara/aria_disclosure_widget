// for ie nonsense
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// add utilities
var util = {
  keyCodes: {
    ENTER: 13,
    SPACE: 32
  },

  generateID: function ( base ) {
    return base + Math.floor(Math.random() * 999);
  }
};


(function ( w, doc, undefined ) {
  /**
   * A11Y Disclosure Widget
   * A component that shows/hides content.
   *
   * Author: Scott O'Hara
   * Version: 1.0.0
   * License: https://github.com/scottaohara/aria_disclosure_widget/blob/master/LICENSE
   */
  var A11YdisclosureOptions = {
    baseID: 'aDW_',
    elClass: 'disclosure',
    blockButtonClass: 'disclosure__trigger--block',
    buttonClass: 'disclosure__trigger',
    elContentClass: 'disclosure__content',
    toggleTipClass: 'disclosure__trigger--tip',

    buttonSelector: '[data-disclosure-btn]',
    contentSelector: '[data-disclosure-content]',

    keepNoJsStateAttr: 'data-disclosure-no-js',
    buttonLabelAttr: 'data-disclosure',
    customClassAttr: 'data-disclosure-class',
    initialStateAttr: 'data-disclosure-open',
    manualClassesAttr: 'data-disclosure-manual-classes',
    typeAttr: 'data-disclosure-type'
  };

  var currentFlyout;

  var A11Ydisclosure = function ( inst, options ) {
    var _options = Object.assign(A11YdisclosureOptions, options);
    var el = inst;
    var button;
    var buttonID;
    var content;
    var contentID;
    var elCustomClass;
    var elID;
    var keepNoJsState;
    var expandedState = false;
    var isFlyout;
    var manualClasses = false;
    var elType;
    var currentToggle;


    /**
     * Initialize the disclosure widget instance.
     * Create the unique IDs per instance, find the
     * necessary children of the widget and run other
     * setup functions.
     */
    var init = function () {
      elID = el.id || util.generateID(_options.baseID);
      el.classList.add(_options.elClass);

      contentID = elID + '_content';
      buttonID = elID + '_btn';
      manualClasses = el.hasAttribute(_options.manualClassesAttr);
      elType = el.getAttribute(_options.typeAttr);
      keepNoJsState = el.getAttribute(_options.keepNoJsStateAttr);
      elCustomClass = el.getAttribute(_options.customClassAttr) || false;

      setupWidget();

      button = el.querySelector(_options.buttonSelector) || generateButton();
      content = el.querySelector(_options.contentSelector);

      setupButton();
      setupContent();
    }; // init()


    /**
     * Look for attributes and setup eventListener
     * on the wrapping widget element.
     */
    var setupWidget = function () {
      if ( el.hasAttribute(_options.initialStateAttr) ) {
        expandedState = true;
      }

      if ( elCustomClass ) {
        el.classList.add(elCustomClass);
      }

      if ( elType === 'flyout' ) {
        isFlyout = true;
      }
    }; // instSetup()


    /**
     * In the event that no button exists, generate one.
     */
    var generateButton = function () {
      var newBtn = doc.createElement('button');
      newBtn.type = 'button';
      newBtn.textContent = el.getAttribute(_options.buttonLabelAttr) || 'More info ';
      el.insertBefore(newBtn, el.firstChild);

      if ( keepNoJsState === 'hidden' ) {
        button.hidden = true;
      }

      if ( keepNoJsState === 'disabled' ) {
        button.disabled = true;
      }

      button = newBtn;
      return button;
    }; // generateButton()


    /**
     * Give the content a unique ID,
     * provide it with default classes (if not overridden)
     * set appropriate state
     */
    var setupContent = function () {
      content.id = contentID;

      if ( !manualClasses ) {
        content.classList.add(_options.elContentClass);
      }

      if ( !expandedState ) {
        content.classList.add('is-hidden');
      }
    }; // setupContent()


    /**
     * Setup the button / trigger as needed
     * 1. if not a button, supply the appropriate attrs
     * 2. provide default classes (if not overridden)
     * 3. provide appropriate attrs for default state
     * 4. add eventListener
     */
    var setupButton = function () {
      /**
       * If not a <button> then turn it into one.
       * Add a tabindex to accommodate for typically
       * non-focusable elements. And remove a link's
       * href attribute, because a button shouldn't
       * get a right-click context menu with menu items
       * for links :)
       */
      if ( button.tagName !== 'BUTTON' ) {
        button.setAttribute('role', 'button');
        button.tabIndex = 0;
        button.removeAttribute('href');
      }

      /**
       * As long as someone hasn't decided to setup their
       * classes manually, then
       */
      if ( !manualClasses ) {
        if ( elType === 'block' ) {
          button.classList.add(_options.blockButtonClass);
        }

        if ( elType === 'tip' ) {
          button.classList.add(_options.toggleTipClass);
        }

        button.classList.add(_options.buttonClass);
      }

      button.id = buttonID;
      button.setAttribute('aria-expanded', expandedState);
      button.setAttribute('aria-controls', contentID);
      /**
       * for no-js, a button should be disabled or hidden
       * by default. Typically these attributes would then
       * be removed when the script runs cause JS is
       * available for the buttons to function.
       *
       * But in the event these attributes need to be
       * maintained for some reason...
       */
      if ( keepNoJsState !== 'hidden' ) {
        button.hidden = false;
      }

      if ( keepNoJsState !== 'disabled' ) {
        button.disabled = false;
      }

      button.addEventListener('click', toggleContent, false);
      button.addEventListener('keypress', keyToggle, false);
    }; // setupButton()


    /**
     * Toggle between the open and close functions
     * based on the current state of the disclosure widget's
     * button expanded state.
     */
    var toggleContent = function ( e ) {
      if ( button.getAttribute('aria-expanded') === 'true' ) {
        closeContent();
      }
      else {
        openContent();
      }
    }; // toggleContent()


    /**
     * Collapse the disclosure widget
     * and update the necessary elements/var.
     */
    var closeContent = function () {
      button.setAttribute('aria-expanded', 'false')
      content.classList.add('is-hidden');
      expandedState = false;
    }; // closeContent()


    /**
     * Expand the disclosure widget
     * and update the necessary elements/var.
     */
    var openContent = function () {
      button.setAttribute('aria-expanded', 'true');
      content.classList.remove('is-hidden');
      expandedState = true;
    }; // openContent()


    /**
     * Handle keyboard events for disclosure widgets:
     * - Space/Enter for non-native button elements.
     * - ESC key for expanded flyout disclosure widgets.
     */
    var keyToggle = function ( e ) {
      var keyCode = e.keyCode || e.which;

      switch ( keyCode ) {
        case util.keyCodes.SPACE:
        case util.keyCodes.ENTER:
          /**
           * This if is necessary to prevent a "bug" in Firefox
           * where native <button>s well double fire the keyEvent,
           * because Firefox also registers this as a click.
           */
          if ( button.tagName !== 'BUTTON' ) {
            e.preventDefault();
            toggleContent(e);
            button.focus();
          }
          break;

        default:
          break;
      }
    }; // keyToggle()

    init.call( this );

    return this;
  }; // A11Ydisclosure()

  w.A11Ydisclosure = A11Ydisclosure;

})( window, document );
