export default function Home() {
  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        The Holy Grail Layout
      </h1>
      <p className="py-2">
        Are you in search of this? In terms of Web design,{" "}
        <a className="text-indigo-600" href="https://en.wikipedia.org/wiki/Holy_grail_(web_design)">
          {"the holy grail is page layout"}
        </a>{" "}
        that has 3 columns. It is commonly desired and implemented, but for many years, the various
        ways in which it could be implemented with available technologies all had drawbacks. Because
        of this, finding an optimal implementation was likened to searching for the elusive Holy
        Grail.
      </p>
      <p className="py-2">
        As of 2021, the Holy Grail layout is implemented using CSS Flexbox or CSS Grid display. For
        this example, were using the{" "}
        <a className="text-indigo-600" href="https://tailwindcss.com/">
          Tailwind CSS
        </a>{" "}
        utility framework. As part of its default classes, Tailwind includes
        <a className="text-indigo-600" href="https://tailwindcss.com/docs/flex-direction">
          Flexbox classes
        </a>{" "}
        which make this implementation possible. The holy grail example is also responsive so that
        the layout stacks vertically on smaller mobile screens.
      </p>
      <p className="py-2">
        Many web pages require a layout with multiple (often three) columns, with the main page
        content in one column (often the center), and supplementary content such as menus and
        advertisements in the other columns (sidebars). These columns commonly require separate
        backgrounds, with borders between them, and should appear to be the same height no matter
        which column has the tallest content. A common requirement is that the sidebars have a fixed
        width, with the center column adjusting in size to fill the window (fluid or liquid layout).
        Another requirement is that, when a page does not contain enough content to fill the screen,
        the footer should drop to the bottom of the browser window instead of leaving blank space
        underneath.
      </p>
      <div className="flex p-3 bg-indigo-600 rounded text-white hidden md:flex">
        <span className="flex-shrink overflow-hidden whitespace-nowrap">&lt;--------</span>
        <div className="flex-grow flex-shrink-0 overflow-ellipsis text-center">
          This center column is fluid so it grows in width as needed!
        </div>
        <span className="flex-shrink overflow-hidden whitespace-nowrap">--------&gt;</span>
      </div>
    </>
  );
}
