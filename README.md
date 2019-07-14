# Webmentions Component

A webcomponent to display webmentions using the webmention.io API.

## Prerequisites

To start using webmentions on your site, you must first declare an endpoint for them.

## Usage

```html
<head>
    ...
    <script type="module" src="./src/web-mentions.js"></script>
</head>
```

```html
<web-mentions>
    <noscript>Could not render webmentions. Check that JavaScript is enabled.</noscript>
</web-mentions>
```

### Attributes

<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Example Value</th>
        <th>Default</th>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td>The target URL for your webmentions</td>
        <td>https://example.com/my-post/</td>
        <td>current URL (<code>window.location.href</code>)</td>
    </tr>
    <tr>
        <td><code>types</code></td>
        <td>which webmention type to include</td>
        <td>like-of</td>
        <td>in-reply-to,mention-of</td>
    </tr>
    <tr>
        <td><code>size</code></td>
        <td>Page size for the API</td>
        <td>5</td>
        <td>10</td>
    </tr>
</table>