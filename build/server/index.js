var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createAsyncThunk, createSlice, configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { createTheme, MantineProvider, Card, Image, Button, Grid, Stack, Box, Title } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const instance = axios.create({
  baseURL: "http://localhost:3000/api/cards",
  // baseURL: "https://api.scryfall.com",
  headers: {
    // "User-Agent": "ArchenemySelector/0.1",
    Accept: "*/*"
  }
});
class CardApi {
}
// constructor() {}
__publicField(CardApi, "fetchAllArchenemyCards", async () => await instance.post("/archenemy").then(({ data }) => data).catch((e) => console.log("e", e)));
const initialState = {
  currentCard: {},
  cardPool: [],
  ongoingCards: [],
  previousCards: []
};
const fetchAllArchenemyCards = createAsyncThunk(
  "cards/fetchAllArchenemyCards",
  async () => await CardApi.fetchAllArchenemyCards().then((data) => {
    console.log("in the action", data);
    return data;
  }).catch((e) => {
  })
);
const cardSliceReducer = {
  chooseSingleCard(state) {
    console.log("cardpool length", state.cardPool.length);
    const randomCard = state.cardPool.splice(
      Math.floor(state.cardPool.length * Math.random()),
      1
    );
    if (state.currentCard.type_line.toLowerCase() === "ongoing scheme") {
      state.ongoingCards.push(state.currentCard);
    } else {
      state.previousCards.push(state.currentCard);
    }
    state.currentCard = randomCard[0];
  },
  abandonScheme(state, action) {
    const index = action.payload.index;
    console.log("index", index);
    const card = state.ongoingCards[index];
    console.log("card", card);
    state.previousCards.push(card);
    state.ongoingCards.splice(index, 1);
  }
};
const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: cardSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
      console.log("payload", action.payload);
      state.cardPool = action.payload.data;
      state.currentCard = action.payload.data[0];
    });
  }
});
const { chooseSingleCard, abandonScheme } = cardsSlice.actions;
const store = configureStore({
  reducer: {
    cards: cardsSlice.reducer
  }
});
const theme = createTheme({
  // Define your theme here
});
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(MantineProvider, {
    theme,
    children: /* @__PURE__ */ jsx(Provider, {
      store,
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const CardCard = ({
  imageUrl,
  buttonText,
  onButtonClick
}) => {
  return /* @__PURE__ */ jsxs(Card, { style: { width: 357, height: 700 }, children: [
    /* @__PURE__ */ jsx(Card.Section, { children: /* @__PURE__ */ jsx(Image, { src: imageUrl, alt: "Card Image", style: { maxWidth: "100%" } }) }),
    buttonText && onButtonClick && /* @__PURE__ */ jsx(Button, { size: "small", mt: "md", fullWidth: true, onClick: onButtonClick, children: buttonText })
  ] });
};
const Home = () => {
  var _a;
  const dispatch = useDispatch();
  const currentCard = useSelector((state) => state.cards.currentCard);
  const previousCards = useSelector((state) => state.cards.previousCards);
  const ongoingCards = useSelector((state) => state.cards.ongoingCards);
  useEffect(() => {
    dispatch(fetchAllArchenemyCards());
  }, []);
  useEffect(() => {
    console.log("currentCard", currentCard);
  }, [currentCard]);
  return /* @__PURE__ */ jsxs(Grid, { children: [
    /* @__PURE__ */ jsxs(Grid.Col, { span: 4, children: [
      /* @__PURE__ */ jsx(Image, { src: (_a = currentCard.image_uris) == null ? void 0 : _a.normal }),
      /* @__PURE__ */ jsxs(Button, { mt: "md", onClick: () => dispatch(chooseSingleCard()), children: [
        "Play ",
        previousCards.length > 0 ? "New" : "A",
        " Scheme"
      ] })
    ] }),
    /* @__PURE__ */ jsx(Grid.Col, { span: 8, children: /* @__PURE__ */ jsxs(Stack, { children: [
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Title, { order: 3, children: "Ongoing Schemes" }),
        ongoingCards.map((card, index) => {
          var _a2;
          return /* @__PURE__ */ jsx(
            CardCard,
            {
              imageUrl: (_a2 = card.image_uris) == null ? void 0 : _a2.normal,
              buttonText: "Abandon Scheme",
              onButtonClick: () => dispatch(abandonScheme({ index }))
            },
            card.id
          );
        })
      ] }),
      /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Title, { order: 3, children: "Previous Schemes" }),
        /* @__PURE__ */ jsx(
          Carousel,
          {
            slideSize: "200px",
            slideGap: "none",
            controlsOffset: "sm",
            controlSize: 26,
            withControls: true,
            withIndicators: false,
            orientation: "horizontal",
            children: previousCards.map((card) => {
              var _a2;
              return /* @__PURE__ */ jsx(Carousel.Slide, { children: /* @__PURE__ */ jsx(CardCard, { imageUrl: (_a2 = card.image_uris) == null ? void 0 : _a2.normal }) }, card.id);
            })
          }
        )
      ] }) })
    ] }) })
  ] });
};
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = withComponentProps(function Home$1() {
  return /* @__PURE__ */ jsx(Home, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-fd6YE7f6.js", "imports": ["/assets/chunk-K6CSEXPM-BkoTNwhC.js", "/assets/index-BwBOqdNf.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-BOzJ4LdF.js", "imports": ["/assets/chunk-K6CSEXPM-BkoTNwhC.js", "/assets/index-BwBOqdNf.js", "/assets/MantineThemeProvider-DWS82EgY.js"], "css": ["/assets/root-BG7rqL_d.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/home-DH_GVw83.js", "imports": ["/assets/MantineThemeProvider-DWS82EgY.js", "/assets/chunk-K6CSEXPM-BkoTNwhC.js", "/assets/index-BwBOqdNf.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-5b90c10b.js", "version": "5b90c10b" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
