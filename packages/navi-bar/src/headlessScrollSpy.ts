/**
 * Based on Gumshoe
 * Copyright (c) Go Make Things, LLC
 * https://github.com/cferdinandi/gumshoe/blob/2435337eaf6df585660cfbc96b74270b9d7fd644/LICENSE.md
 **/ 

export type TableOfContents = TableOfContentsItem[]

export interface TableOfContentsItem {
  id: string
  level: number
  title: any
  children: TableOfContents
}

export interface Item {
  heading: Element,
  id: string,
  parentIds: string[],
  distance: number
}

export interface ScrollSpyOptions {
  callback: (item?: Item) => void,
  container?: any,
  tableOfContents: TableOfContents
  offset?: number
}

export type ScrollSpy = ReturnType<typeof createScrollSpy>

export function createScrollSpy(options: ScrollSpyOptions) {
  let items = [] as Item[];
  let activeItem: Item | undefined;
  let eventTimeout, docHeight;
  let {
    tableOfContents,
    offset = 0,
  } = options
  let callback: null | ((item?: Item) => void) = options.callback
  let container: Node = options.container || window as any

  /**
	 * Get an element's distance from the top of the Document.
	 * @private
	 * @param  {Node} elem The element
	 * @return {Number}    Distance from the top in pixels
	 */
  function getOffsetTop(elem: any): number {
    var location = 0;
    if (elem.offsetParent) {
      do {
        location += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    } else {
      location = elem.offsetTop;
    }
    location = location - offset;
    return location >= 0 ? location : 0;
  };

  /**
   * Determine if an element is in the viewport
   * @param  {Node}    elem The element
   * @return {Boolean}      Returns true if element is in the viewport
   */
  function isInViewport(elem: Element): boolean {
    var distance = elem.getBoundingClientRect();
    return (
      distance.top >= 0 &&
      distance.left >= 0 &&
      distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      distance.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  /**
   * Arrange nagivation elements from furthest from the top to closest
   * @private
   */
  function sortNavs() {
    items.sort((a, b) => {
      if (a.distance > b.distance) {
        return -1;
      }
      if (a.distance < b.distance) {
        return 1;
      }
      return 0;
    });
  };
  
	/**
	 * Determine which navigation element is currently active and run activation method
	 * @public
	 * @returns {Object} The current nav data.
	 */
	function refresh(): Item | undefined {

    // Calculate distances
		docHeight = getDocumentHeight(); // The document
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
			item.distance = getOffsetTop(item.heading); // Each navigation target
    }

		// When done, organization navigation elements
		sortNavs();

		// Get current position from top of the document
    var position = window.pageYOffset;
    
		// If at the bottom of the page and last section is in the viewport, activate the last nav
		if ( (window.innerHeight + position) >= docHeight && isInViewport( items[0].heading ) ) {
      changeActive(items[0])
			return items[0];
		}

		// Otherwise, loop through each nav until you find the active one
		for (var i = 0, len = items.length; i < len; i++) {
			var nav = items[i];
			if ( nav.distance <= position ) {
				changeActive(nav);
				return nav;
			}
		}

		// If no active nav is found, deactivate the current nav
		changeActive()

  }

  function changeActive(item?: Item) {
    // Debounce the actual changes, as we don't need to re-render on each 
    // and every change.
    if (eventTimeout) {
      clearTimeout(eventTimeout)
    }
    eventTimeout = setTimeout(() => {
      if (callback && activeItem !== item) {
        activeItem = item
        callback(item)
      }
    }, 40)
  }

  /**
	 * Dispose the current instance.
	 * @public
	 */
	function dispose() {
    // Remove event listeners
		container.removeEventListener('resize', refresh, false);
    container.removeEventListener('scroll', refresh, false);

    // Clear out variables
    callback = null;
		items = [];
		eventTimeout = null;
		docHeight = null;
    
  };

  /**
   * Recursively add the table of contents' headings to our list of headings.
   */
  function addItems(toc: TableOfContents, parentIds: string[] = []) {
    toc.forEach(tocItem => {
      addItems(tocItem.children, tocItem.id ? parentIds.concat(tocItem.id) : parentIds)

      if (!tocItem.id) {
        return
      }
      let heading = document.getElementById(tocItem.id)
      if (!heading) {
        return
      }
      items.push({
        heading,
        distance: 0,
        id: tocItem.id,
        parentIds,
      })
    })
  }

  addItems(tableOfContents)

  // If no navigation elements exist, stop running gumshoe
  if ( items.length === 0 ) return;

  // Run init methods
  refresh();

  // Listen for events
  container.addEventListener('resize', refresh, false);
  container.addEventListener('scroll', refresh, false);

  return {
    dispose,
    refresh,
  }
}


/**
 * Get the height of an element.
 * @private
 * @param  {Node} elem The element to get the height of
 */
function getHeight(elem: Element): number {
  return Math.max( elem.scrollHeight, (elem as any).offsetHeight, elem.clientHeight );
};

/**
 * Get the document element's height
 * @private
 */
function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
};
