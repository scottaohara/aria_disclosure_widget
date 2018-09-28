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
     * Look for attributes and setup eventListeners
     * on the wrapping widget element.
     */
    var setupWidget = function () {
      if ( el.hasAttribute(_options.initialStateAttr) ) {
        expandedState = true;
      }

      if ( !elCustomClass ) {
        el.classList.add(elCustomClass);
      }


      if ( elType === 'flyout' ) {
        isFlyout = true;

        // el.addEventListener('focusout', function ( e ) {

        // }, false);
      }
      if ( isFlyout ) {
        el.addEventListener('focusout', outsideFocus, false);
      }
      el.addEventListener('keypress', keyEvents, false);
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
        content.hidden = true;
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
        button.focus();
        /*
          Firefox/Safari don't focus buttons on mouse click,
          which can result in a bug with how focusOut
          works with flyouts.
          But, setting focus to a button on activation
          will fix this issue for these browsers
        */

        if ( isFlyout ) {
          outsideClick();
        }
      }
    }; // toggleContent()


    /**
     * Collapse the disclosure widget
     * and update the necessary elements/var.
     */
    var closeContent = function () {
      button.setAttribute('aria-expanded', 'false')
      content.hidden = true;
      expandedState = false;
    }; // closeContent()


    /**
     * Expand the disclosure widget
     * and update the necessary elements/var.
     */
    var openContent = function () {
      button.setAttribute('aria-expanded', 'true');
      content.hidden = false;
      expandedState = true;
    }; // openContent()


    /**
     * If a user clicks outside of a flyout disclosure widget
     * (non-modal dialog) then often an expectation
     * is that the outside click will close the widget.
     */
    var outsideClick = function () {
      var outsideListener = function ( e ) {
        if ( !el.contains(e.target) ) {
          closeContent();
          removeOutsideListener();
        }
      }; // outsideListener()

      var removeOutsideListener = function () {
        doc.removeEventListener('click', outsideListener);
        // doc.removeEventListener('touchstart', outsideListener);
      }; // removeOutsideListener()

      /**
       * Note:
       * adding touchstart/end here allows for touch outside of a
       * flyout disclosure to close it on iOS.  However, adding
       * this eventListener also breaks the announcement of
       * the disclosure widget's current state after initial toggle.
       *
       * Need to look into this more...
       */
      doc.addEventListener('click', outsideListener, false);
      // doc.addEventListener('touchstart', outsideListener, false);
    }; // outsideClick()


    /**
     * If a user focuses outside of a flyout disclosure widget
     * (non-modal dialog) then to match "clicking" outside
     * the widget should collapse.
     */
    var outsideFocus = function () {
      isFlyout = true;
      setTimeout( function () {
        if ( !el.contains(doc.activeElement) ) {
          closeContent();
        }
      }, 200);
    }; // outsideFocus()

    /**
     * Handle keyboard events for disclosure widgets:
     * - Space/Enter for non-native button elements.
     * - ESC key for expanded flyout disclosure widgets.
     */
    var keyEvents = function ( e ) {
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
            toggleContent();
          }
          break;

        case util.keyCodes.ESC:
          /**
           * Escape key should only work if the
           * content is expanded, and if the disclosure
           * widget is a flyout. Otherwise ESC to close
           * would be unexpected.
           */
          if ( expandedState && isFlyout ) {
            toggleContent()
            button.focus(); // return focus to button so it doesn't get lost
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

})( window, document );
