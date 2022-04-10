import { MetaFunction } from "remix";
import flowDiagram from "../media/flow-diagram.png";
import metaImage from "../media/meta.jpg";
import Link from "~/components/Link";
import * as constants from "~/constants";

const description =
  "How to set up your Remix app to use light, dark, and custom themes";

export const meta: MetaFunction = () => {
  return {
    description: description,
    "og:description": description,
    "twitter:description": description,
    keywords: [
      "hovalabs",
      "hova labs",
      "the hovas",
      "design system",
      "design systems",
      "css",
      "css variables",
      "theme",
      "themes",
      "custom themes",
      "light theme",
      "dark theme",
      "light mode",
      "dark mode",
      "remix",
      "remix run",
      "react",
      "react-theme-helper",
      "javascript",
      "typescript",
      constants.TITLE,
    ].join(", "),
    author: "The Hovas",
    title: constants.TITLE,
    "og:title": constants.TITLE,
    "og:image": metaImage,
    "twitter:card": "summary_large_image",
    "twitter:title": `${constants.SITE_URL}${constants.TITLE}`,
    "twitter:image:width": "1200",
    "twitter:image:height": "630",
    "twitter:image": `${constants.SITE_URL}${metaImage}`,
  };
};

export default function Index() {
  return (
    <div>
      <h1>{constants.TITLE}</h1>
      <p>
        This site is a minimal example of how to set up a{" "}
        <Link href="https://remix.run/">Remix</Link> app with light, dark, and
        custom themes. Although we're sticking to vanilla css, the concepts
        covered here apply to css frameworks such as Tailwind,
        styled-components, etc...
      </p>
      <Link href="https://github.com/HovaLabs/better-theme-management-with-remix/">
        Check out the code on Github
      </Link>
      <h1>Our requirements</h1>
      <p>
        Let's start with our requirements. If you've read{" "}
        <Link href="https://www.joshwcomeau.com/react/dark-mode/">
          The Quest for the Perfect Dark Mode
        </Link>{" "}
        this list may look familiar. Apologies for the copy/pasting, Josh, but
        your list of requirements are too perfect to not re-use.
      </p>
      <p>Here's our set of criteria for this feature:</p>
      <ul>
        <li>
          The user should be able to click a toggle to switch between light and
          dark mode.
        </li>
        <li>
          ✨New Requirement✨ - The user should be able to select other custom
          themes as well.
        </li>
        <li>
          The user's preference should be saved, so that future visits use the
          correct color theme.
        </li>
        <li>
          It should default to the user's "preferred" color scheme, according to
          their operating system settings. If not set, it should default to
          light.
        </li>
        <li>
          The site should not flicker on first load, even if the user has
          selected a non-default color theme.
        </li>
        <li>The site should never show the wrong theme.</li>
        <li>
          ✨Unspoken Bonus Requirement (that we took for granted 😅)✨ - The
          user's current url should not change, and browser history should not
          update when the theme is updated.
        </li>
      </ul>
      <h2>Some notes about the tech stack</h2>
      <ul>
        <li>
          We want to build our app with{" "}
          <Link href="https://remix.run">Remix</Link> and utilize cookies to
          remember our user's theme preference.
        </li>
        <li>
          In addition to supporting light/dark mode, we want to support using
          custom themes. For this blog post, we'll use a "Christmas" theme, but
          it's worth pointing out, there are much more useful (but not as
          🎄festive🎄) accessibility-targeted themes which could be implemented
          following this pattern.
        </li>
      </ul>
      <p>Let's reimagine these requirements as a "Theme Decision Tree":</p>
      <div className="flow-diagram-wrapper">
        <img
          alt="requirements-flow-diagram"
          className="flow-diagram"
          src={flowDiagram}
        />
      </div>
      <h1>The CSS</h1>
      <p>
        In order to meet the requirements described above, we create two sets of
        light and dark mode css variables. The first set is for handling default
        behavior, and the second set is for handling when the user manually
        selects a theme. In addition, we'll create one class per each custom
        theme we want to support.
      </p>
      <h2>
        CSS variable pattern<div>☀️ ➡ 🌑 ➡ ☀️ ➡ 🌑 ➡ 🎄</div>
      </h2>

      <p>When defining our theme's css-variables, we follow this pattern:</p>
      <ol>
        <li>Default behavior</li>
        <li>Default dark-mode behavior</li>
        <li>Class-driven light-mode behavior</li>
        <li>Class-driven dark-mode behavior</li>
        <li>Class-driven custom theme behavior(s)</li>
      </ol>
      <pre>
        {`/* app/styles/root.css */

/* 1. Default to a light theme */
:root {
  --background: white;
  --onBackground: black
}

/* 2. Overwrite css variables if device prefers dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --background: black;
    --onBackground: white;
  }
}

/* 3. Manually overwrite css variables by setting class="light" */
.light {
  --background: white;
  --onBackground: black;
}

/* 4. Manually overwrite css variables by setting class="dark" */
.dark {
  --background: black;
  --onBackground: white;
}

/* 5. Manually overwrite css variables by setting class="christmas" */
.christmas {
  --background: green;
  --onBackground: red;
}`}
      </pre>
      <p>
        By declaring css variables in the order described above, we've set up
        the css to meet our requirements. The site's default behavior is to
        automatically match the OS's light/dark theme preference. We still need
        to do some work to allow the user to manually modify the theme, and for
        the site to remember this decision.
      </p>
      <h2>Setting up the theme cookie</h2>
      <p>
        We're going to use a cookie to "remember" if a browser has set a
        preferred theme. To set up our cookie we're going to use Remix's
        "createCookie" API.
      </p>
      <pre>
        {`// app/cookies.ts
import { createCookie } from "remix";

export const userPrefs = createCookie("userPrefs", {
  maxAge: 31_536_000, // one year
});`}
      </pre>
      <h1>Using react-theme-helper</h1>
      <p>
        To smooth out our implementation, we've created a utility package,
        called{" "}
        <Link href="https://github.com/HovaLabs/react-theme-helper">
          react-theme-helper
        </Link>
        . This package exposes several helper tools as follows:
      </p>
      <pre>
        {`// app/theme.tsx
import createThemeHelper from "react-theme-helper";

export const {
  nullishStringToThemeName,
  useThemeInfo,
  ThemeProvider
} = createThemeHelper(["light", "dark", "christmas"]);`}
      </pre>
      <p>
        <b>nullishStringToThemeName</b> coerces a string into one of our themes.
        If the string doesn't match any of our theme values, it will return
        undefined. We can use this function on the frontend and the backend.
      </p>
      <p>
        <b>useThemeInfo</b> is a react hook that will provide the user-selected
        theme, the os's current theme, and a function to update the
        user-selected theme.
      </p>
      <p>
        <b>ThemeProvider</b> is a React component which provides theme context
        and holds state for managing optimistic state UI updates.
      </p>
      <h1>Setting the theme by submitting a form</h1>
      <p>
        Remix allows each route to have an action handler, which can reply with
        a{" "}
        <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Response">
          response-compliant payload
        </Link>
        . In this case, when a user clicks on the "Toggle Theme" button, a form
        is submitted to our <b>root</b> route. The action handler will reply to
        with the new theme value, baked into a cookie.
      </p>
      <p>Here's the form:</p>
      <pre>
        {`// app/root.tsx
import { Form } from 'remix';

...

<Form method="post">
  <input type="hidden" name="theme" value="dark" />
  <button type="submit">Toggle Theme</button>
</Form>`}
      </pre>
      <p>And here's the matching action handler:</p>
      <pre>
        {`import { ActionFunction } from 'remix';
import { nullishStringToThemeName } from "~/theme";
import { userPrefs } from '~/cookie';

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const bodyParams = await request.formData();

  // This utility function will coerce our theme
  // to a valid theme or undefined
  const theme = nullishStringToThemeName(bodyParams.get("theme"));

  cookie.theme = theme ?? null;

  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
};
`}
      </pre>
      <p>
        Any future requests for this site from the browser will include this
        cookie.
      </p>
      <h1>Serving the website</h1>
      <p>
        When a user visits the site, they will send to the server a cookie.
        Here's how we can parse that cookie and set up our React context.
      </p>
      <pre>
        {`// app/root.tsx

import { Form, useLoaderData } from "remix";
import { nullishStringToThemeName, ThemeProvider } from "~/theme";

import type { LoaderFunction } from "remix";

type Theme = "light" | "dark" | "christmas" | undefined;

interface LoaderData {
  theme: Theme;
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  let themeName = nullishStringToThemeName(cookie.theme);
  return { themeName };
};

export default function AppWithContexts() {
  const { themeName: cookieThemeName } = useLoaderData<LoaderData>();

  return (
    <ThemeProvider themeName={cookieThemeName}>
      <App />
    </ThemeProvider>
  );
}

function App() {
  return <html /> // etc...
}`}
      </pre>
      <p>
        By wrapping our app in <b>ThemeProvider</b> we can now call the hook{" "}
        <b>useThemeInfo</b> anywhere in our app.
      </p>
      <h1>Setting up the theme toggle</h1>
      <p>
        We're going a bit full-circle here. Now that the root loader function
        has parsed our cookie, we can use the combination of the cookie value
        and the OS's current theme to determine what value our theme toggle
        should pass when clicked.
      </p>
      <p>
        By default, clicking the theme toggle will submit a form to our root
        action handler, which will redirect the user to <b>/</b> and zap any
        existing query parameters. To prevent this redirection, while still
        allowing the server to update our cookie, we handle the form submission
        entirely client-side. See the form handler and form below:
      </p>
      <pre>
        {`// app/components/ThemeToggle.tsx

import { nullishStringToThemeName, useThemeInfo } from "~/theme";

export default function ThemeToggle() {
  const { themeName, osThemeName, setThemeName } = useThemeInfo();
  const submitForm = useSubmit();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newTheme = nullishStringToThemeName(form.get("theme"));

    // Instantaneously update the theme, client-side
    setThemeName(newTheme);

    // Submitting the form will update our cookie
    submitForm(e.currentTarget, { replace: true });
  };

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <input type="hidden" name="theme" value={setThemeTo} />
      <button type="submit">Toggle Theme</button>
    </Form>
  );
}`}
      </pre>
      <h1>Setting a custom theme</h1>
      <p>
        To allow setting and unsetting a custom theme, we've added two
        additional forms, with a hidden input's value set to "christmas" and "",
        respectively
      </p>
      <pre>
        {`<Form method="post" onSubmit={handleSubmit}>
  <input type="hidden" name="theme" value="christmas" />
  <button type="submit">Christmas Theme</button>
</Form>
<Form method="post" onSubmit={handleSubmit}>
  <input type="hidden" name="theme" value="" />
  <button type="submit">Reset Theme</button>
</Form>`}
      </pre>
      <h1>What's still missing</h1>
      <h2>The server doesn't know the OS's theme preference</h2>
      <p>
        You may notice there's no way for the server-rendered html to detect
        light/dark mode unless a cookie is set. We're able to avoid a "first
        render flash" by utilizing css media queries, but the server-rendered
        html remains unaware of the client's theme preference. If we wanted a
        toggle to render content differently for light/dark mode and could not
        achieve the result with css media queries, we would need to hack a bit
        further.
      </p>
      <h2>We're relying on client hydration for our form</h2>
      <p>
        In order to prevent the client from getting redirected when submitting
        the theme-toggle form, we're making the form submission on client side.
        Ideally, we should instead submit a form instead of calling{" "}
        <b>preventDefault</b>.
      </p>
      <h1>That's it</h1>
      <p>
        Hope you enjoyed this post. Please check out{" "}
        <Link href="https://github.com/hovalabs/better-theme-management-with-remix">
          the actual code
        </Link>
        , as I believe it provides a much more realistic context. If there's a
        way we can improve the example or supporting notes, we'd love your
        feedback.{" "}
        <Link href="https://github.com/HovaLabs/better-theme-management-with-remix/issues/new">
          We're open to PR's.
        </Link>
      </p>
      <h2>Thanks for reading</h2>
      <p>
        ❤️ <Link href="https://hovalabs.com">The Hovas</Link>
      </p>
    </div>
  );
}
