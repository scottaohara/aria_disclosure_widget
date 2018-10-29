# ARIA Disclosure Widgets  
Progressively enhanced disclosure widgets (show/hide toggle areas) built with vanilla JavaScript and ARIA attributes.

A disclosure widget consists of a button that toggles the state of its associated content to be expanded or collapsed. In native HTML, a disclosure widget would best parallel to a `detail` and `summary` markup pattern.


## Minimum Required Markup
```html
<div data-disclosure="A generated button">
  <p data-disclosure-content>
    ...
  </p>
</div>
```

If you want a bit more control...
```html
<div id="ex2" data-disclosure data-disclosure-open data-disclosure-class="test-class">
  <h#>
    <span data-disclosure-btn>
      Disclosure span within a heading
    </span>
  </h#>
  <div data-disclosure-content>
    <!--
      Add any content here that would be appropriate
      for the document outline you're looking to create.
    -->
  </div>
</div>
```

## How does it work?  
MAGIC (sorry, I'll write this out later.)


## Keyboard Controls

## License & Such  
This script was written by [Scott O'Hara](https://twitter.com/scottohara).

It has an [MIT license](https://github.com/scottaohara/accessible-components/blob/master/LICENSE.md).

Do with it what you will :)

