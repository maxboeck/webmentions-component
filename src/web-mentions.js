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
        this.size = 10
        this.page = 0
        this.isLastPage = false
        this.isLoading = false
    }

    static get properties() {
        return {
            url: { type: String },
            types: { type: Array },
            size: { type: Number },
            page: { type: Number, reflect: true },
            isLastPage: { type: Boolean, attribute: false },
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
        this.init()
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

        const sanitizeContent = entry => {
            const { text, html } = entry.content
            if (html) {
                entry.content.value = html
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

    async init() {
        this.webmentions = await this.fetchData()
    }

    async loadNextPage() {
        this.page += 1
        const nextPage = await this.fetchData()
        this.webmentions = this.webmentions.concat(nextPage)
    }

    async fetchData() {
        const API_ORIGIN = 'https://webmention.io/api/mentions.jf2'
        const query = this.buildQueryString({
            target: this.url,
            page: this.page,
            'per-page': this.size
        })

        try {
            this.isLoading = true
            const response = await fetch(`${API_ORIGIN}?${query}`)
            if (response.ok) {
                const json = await response.json()
                const webmentions = this.process(json.children)

                if (json.children.length < this.size) {
                    this.isLastPage = true
                }

                this.isLoading = false
                return webmentions
            }
        } catch (err) {
            console.error(err)
            this.isLoading = false
            return false
        }
    }

    render() {
        if (!this.isLoading && !this.webmentions.length) {
            return html`
                <p>No Webmentions yet.</p>
            `
        }

        const loadingMsg = html`
            <p>Loading Webmentions...</p>
        `

        const nextPageBtn = !this.isLastPage
            ? html`
                  <button type="button" @click=${this.loadNextPage}>
                      Load Next Page
                  </button>
              `
            : null

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
            ${this.isLoading ? loadingMsg : nextPageBtn}
        `
    }
}

customElements.define('web-mentions', WebMentions)
