import { LitElement, html, css } from 'lit-element'
import { repeat } from 'lit-html/directives/repeat.js'
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'

import './web-mention.js'

class WebMentions extends LitElement {
    constructor() {
        super()

        this.webmentions = []
        this.url = window.location.href
        this.types = ['in-reply-to', 'like-of', 'repost-of', 'mention-of']
        this.size = 20
        this.page = 0
        this.isLoading = false
    }

    static get properties() {
        return {
            url: { type: String },
            types: { type: Array },
            size: { type: Number, reflect: true },
            page: { type: Number, reflect: true },
            webmentions: { type: Array, attribute: false },
            isLoading: { type: Boolean, attribute: false }
        }
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }
            ol {
                padding: 0;
                margin: 0;
                list-style-type: none;
            }
            li {
                margin-bottom: 2em;
            }
        `
    }

    connectedCallback() {
        super.connectedCallback()
        this.fetchWebmentions()
    }

    attributeChangedCallback(name, oldval, newval) {
        if (['page', 'size', 'types'].includes(name)) {
            this.fetchWebmentions()
        }
        super.attributeChangedCallback(name, oldval, newval)
    }

    buildQueryString(data) {
        const query = []
        for (let param in data) {
            if (data.hasOwnProperty(param)) {
                const value = data[param]
                if (Array.isArray(value)) {
                    value.forEach(entry => {
                        query.push(`${param}[]=${encodeURIComponent(entry)}`)
                    })
                } else {
                    query.push(`${param}=${encodeURIComponent(value)}`)
                }
            }
        }
        return query.join('&')
    }

    process(data) {
        const checkRequiredFields = entry => {
            const { author, published, content } = entry
            return !!author && !!author.name && !!published && !!content
        }

        //TODO: write a minimal html cleaner
        const sanitizeHTML = html => html

        const sanitizeContent = entry => {
            const { text, html } = entry.content
            if (html) {
                entry.content.value = sanitizeHTML(html)
            } else {
                entry.content.value = `<p>${text}</p>`
            }
            return entry
        }

        return data
            .filter(entry => this.types.includes(entry['wm-property']))
            .filter(checkRequiredFields)
            .map(sanitizeContent)
    }

    async fetchWebmentions() {
        const API_ORIGIN = 'https://webmention.io/api/mentions.jf2'
        const query = this.buildQueryString({
            target: this.url,
            'per-page': this.size,
            page: this.page
        })

        try {
            this.isLoading = true
            const response = await fetch(`${API_ORIGIN}?${query}`)
            if (response.ok) {
                const json = await response.json()
                const webmentions = this.process(json.children)

                this.isLoading = false
                this.webmentions = webmentions
            }
        } catch (err) {
            console.error(err)
            this.isLoading = false
        }
    }

    render() {
        if (this.isLoading) {
            return html`
                <p>Loading...</p>
            `
        }

        return html`
            <ol>
                ${repeat(
                    this.webmentions,
                    item => item['wm-id'],
                    item => html`
                        <li>
                            <web-mention
                                url=${item.url}
                                author=${item.author.name}
                                avatar=${item.author.photo}
                                published=${item.published}
                            >
                                ${unsafeHTML(item.content.value)}
                            </web-mention>
                        </li>
                    `
                )}
            </ol>
        `
    }
}

customElements.define('web-mentions', WebMentions)
