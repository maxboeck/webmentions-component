import { LitElement, html, css } from 'lit-element'
import { repeat } from 'lit-html/directives/repeat.js'
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'

import './web-mention.js'

class WebMentions extends LitElement {
  constructor() {
    super()

    this.webmentions = []
    this.counter = {}

    this.url = window.location.href
    this.types = ['in-reply-to', 'mention-of']
    this.size = 10
    this.page = 0
    this.withCounter = true
    this.isLastPage = false
    this.isLoading = false
  }

  static get properties() {
    return {
      url: { type: String },
      types: { type: Array },
      size: { type: Number },
      page: { type: Number, reflect: true },
      withCounter: { type: Boolean },
      isLastPage: { type: Boolean, attribute: false },
      isLoading: { type: Boolean, attribute: false },
      webmentions: { type: Array, attribute: false },
      counter: { type: Object, attribute: false }
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .webmentions-counter {
        display: flex;
        flex-wrap: wrap;
        list-style-type: none;
        padding: 0;
        margin-bottom: 2rem;
      }
      .webmentions-counter li {
        margin-right: 1em;
      }
      .webmentions-list {
        padding: 0;
        margin: 0;
        list-style-type: none;
      }
      .webmentions-item {
        margin-bottom: 2em;
      }
      .webmentions-footer {
        text-align: center;
      }
      .webmentions-btn {
        display: inline-block;
        height: 2.5rem;
        padding: 0 1rem;
        border: 0;
        font-size: 1rem;
        white-space: nowrap;
        line-height: 2.5rem;
        color: #fff;
        border-radius: var(--wm-border-radius, 4px);
        background-color: var(--wm-primary-color, #004283);
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
    if (this.withCounter) {
      this.counter = await this.fetchCounter()
    }
    this.webmentions = await this.fetchMentions()
  }

  async loadNextPage() {
    this.page += 1
    const nextPage = await this.fetchMentions()
    this.webmentions = this.webmentions.concat(nextPage)
  }

  async fetchCounter() {
    const API_ORIGIN = 'https://webmention.io/api/count'
    const query = this.buildQueryString({
      target: this.url
    })

    try {
      const response = await fetch(`${API_ORIGIN}?${query}`)
      if (response.ok) {
        const json = await response.json()
        return json
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async fetchMentions() {
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

  renderCounter() {
    if (this.withCounter && this.counter.type) {
      const {
        like: likeCount,
        repost: repostCount,
        mention: mentionCount
      } = this.counter.type

      return html`
        <ul class="webmentions-counter">
          <li title="Likes">❤️ ${likeCount}</li>
          <li title="Reposts">♻️ ${repostCount}</li>
          <li title="Mentions">💬 ${mentionCount}</li>
        </ul>
      `
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
          <button
            type="button"
            class="webmentions-btn"
            @click=${this.loadNextPage}
          >
            Load Next Page
          </button>
        `
      : null

    return html`
      ${this.renderCounter()}
      <ol class="webmentions-list">
        ${repeat(
          this.webmentions,
          item => item['wm-id'],
          item => html`
            <li class="webmentions-item">
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
      <div class="webmentions-footer">
        ${this.isLoading ? loadingMsg : nextPageBtn}
      </div>
    `
  }
}

customElements.define('web-mentions', WebMentions)
