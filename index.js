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
   * Disclosure widgets are incredibly versatile in that they
   * can be the basis for various different types of UI
   * components, from drop menus, hamburger navigation,
   * or standard show/hide content components.
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

  var prevFlyoutBtn = false;

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
    var isFlyout = false;
    var manualClasses = false;
    var elType;


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

      button = el.querySelector(_options.buttonSelector) || generateButton();
      content = el.querySelector(_options.contentSelector);

      setupWidget();
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
        el.addEventListener('keypress', keyEsc, false);
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

      if ( isFlyout ) {
        content.tabIndex = '-1';
        el.addEventListener('focusout', outsideFocus, false);
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

      button.addEventListener('mousedown', toggleContent, false);
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

        if ( isFlyout ) {
          prevFlyoutBtn = false;
          return prevFlyoutBtn;
        }
      }
      else {
        openContent();

        if ( isFlyout ) {
          var thisBtnID = e.target.id;
          var thisBtn = doc.getElementById(thisBtnID);
        }

        if ( prevFlyoutBtn ) {
          var prevBtn = doc.getElementById(prevFlyoutBtn);
          var prevContent = doc.getElementById(prevBtn.getAttribute('aria-controls'));

          prevBtn.setAttribute('aria-expanded', 'false');
          prevContent.classList.add('is-hidden');
        }

        prevFlyoutBtn = thisBtnID || false;
        return prevFlyoutBtn;
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
     * If a user focuses outside of a flyout disclosure widget
     * (non-modal dialog) then to match "clicking" outside
     * the widget should collapse.
     */
    var outsideFocus = function () {
      setTimeout( function () {
        if ( !el.contains(doc.activeElement) ) {
          closeContent();

          prevFlyoutBtn = false;
          return prevFlyoutBtn;
        }
      }, 1);
    }; // outsideFocus()


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
          e.preventDefault();
          toggleContent(e);
          button.focus();
          break;

        default:
          break;
      }
    } // keyToggle()

    var keyEsc = function ( e ) {
      var keyCode = e.keyCode || e.which;

      switch ( keyCode ) {
        case util.keyCodes.ESC:
          /**
           * Escape key should only work if the content is expanded,
           * focus is currently within the widget, and if the widget
           * is a flyout. Otherwise ESC to close would be unexpected.
           */
          if ( expandedState && isFlyout ) {
            toggleContent()
            button.focus(); // return focus to button so it doesn't get lost
          }
          break;

        default:
          break;
      }
    } // keyClose();


    init.call( this );

    return this;
  }; // A11Ydisclosure()

  w.A11Ydisclosure = A11Ydisclosure;

})( window, document );
