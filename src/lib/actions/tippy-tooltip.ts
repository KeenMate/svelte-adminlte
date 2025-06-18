// @ts-ignore
import tippy, {type Instance, type Props} from "tippy.js"

type nullable = null | undefined

interface TippyTooltipOptions {
	content: string | nullable
	templateId: string | nullable,
	tippyOptions: Props
}

class TippyTooltip {
	rootElement: HTMLElement
	options: TippyTooltipOptions | nullable

	tippyInstance: Instance

	constructor(element: HTMLElement, options: TippyTooltipOptions | nullable = null) {
		this.rootElement = element
		this.options     = options
	}

	init() {
		this.updateHTML()
		this.setupObserver()

		const instance = this

		return {
			update(options: TippyTooltipOptions | nullable) {
				instance.options = options

				instance.updateHTML()
			},
			destroy() {
			}
		}
	}

	setupObserver() {
		const observer = new MutationObserver(() => {
			this.updateHTML()
		})
	}

	updateHTML() {
		const content = this.getContent()

		if (!content) {
			if (this.tippyInstance) {
				this.tippyInstance.destroy()
				this.tippyInstance = null
			}

			return
		}

		if (this.tippyInstance) {
			this.tippyInstance.setContent(content)

			if (this.options?.tippyOptions) {
				this.tippyInstance.setProps(this.options.tippyOptions)
			}
		} else {
			this.tippyInstance = tippy(this.rootElement, {
				...this.options?.tippyOptions,
				content
			} as any)
		}
	}

	getContent(): string {
		if (this.options?.content) {
			return this.options.content
		}

		const templateElement = this.options?.templateId
			&& document.getElementById(this.options?.templateId)
			|| this.rootElement.querySelector(".tippy-template") as HTMLElement

		if (!templateElement) {
			console.error("Neither template nor content was not found", this.rootElement, this.options?.templateId)
			// throw new Error("Neither template nor content was not found")
			return ""
		}

		return templateElement.innerHTML
	}
}

export default function (element: HTMLElement, options: TippyTooltipOptions) {
	const instance = new TippyTooltip(element, options)

	return instance.init()
}
