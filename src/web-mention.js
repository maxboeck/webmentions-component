import { LitElement, html, css } from 'lit-element'

class WebMention extends LitElement {
  constructor() {
    super()

    this.url = ''
    this.author = 'Anonymous'
    this.avatar = ''
    this.published = ''
  }

  static get properties() {
    return {
      url: { type: String },
      author: { type: String },
      avatar: { type: String },
      published: { type: String }
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      a,
      ::slotted(a) {
        color: var(--wm-primary-color);
      }
      a:hover,
      a:focus,
      ::slotted(a:hover),
      ::slotted(a:focus) {
        text-decoration: none;
      }
      .webmention-avatar {
        border-radius: 50%;
        object-fit: cover;
        margin-right: 0.5em;
        background-color: #ededed;
      }
      .webmention-meta,
      .webmention-link {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }
      .webmention-meta {
        margin-bottom: 0.5em;
      }
      .webmention-link {
        margin-right: 1em;
      }
      .webmention-time {
        font-size: 0.875em;
      }
    `
  }

  formatDate(iso) {
    const date = new Date(iso)
    const zeroPad = num => (num < 10 ? '0' + num : num)

    const yyyy = date.getFullYear()
    const dd = zeroPad(date.getDate())
    const MM = zeroPad(date.getMonth() + 1)
    const HH = zeroPad(date.getHours())
    const mm = zeroPad(date.getMinutes())

    return `${dd}.${MM}.${yyyy} - ${HH}:${mm}`
  }

  render() {
    return html`
      <div class="webmention h-cite">
        <div class="webmention-meta">
          <a href=${this.url} class="webmention-link u-url">
            <img
              src=${this.avatar}
              class="webmention-avatar u-photo"
              width="40"
              height="40"
              alt=""
            />
            <span class="p-name">${this.author}</span>
          </a>
          <time datetime=${this.published} class="webmention-time dt-published">
            ${this.formatDate(this.published)}
          </time>
        </div>
        <div class="webmention-content p-content">
          <slot></slot>
        </div>
      </div>
    `
  }
}

customElements.define('web-mention', WebMention)
