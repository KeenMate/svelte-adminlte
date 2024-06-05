// todo: move to dev code
// import "@fortawesome/fontawesome-free/css/all.css";
// import "icheck-bootstrap/icheck-bootstrap.css";
// import "admin-lte/build/scss/adminlte.scss";
// import "toastr/build/toastr.css";
// import "admin-lte/dist/js/adminlte";

export {Config} from "./config.js"

/* [1] Alerts */
export {default as BaseAlert} from "./alerts/BaseAlert.svelte"
export {default as DangerAlert} from "./alerts/DangerAlert.svelte"
export {default as InfoAlert} from "./alerts/InfoAlert.svelte"
export {default as SuccessAlert} from "./alerts/SuccessAlert.svelte"
export {default as WarningAlert} from "./alerts/WarningAlert.svelte"

/* [2] Form */
//export { default as LteSwitch } from "./form/LteSwitch.svelte"; //!use Switch instead

/* [2.1] Form > Input */
export {default as Checkbox} from "./form/input/Checkbox.svelte"
export {default as CheckboxSimple} from "./form/input/CheckboxSimple.svelte"
export {default as DateRangePicker} from "./form/input/DateRangePicker.svelte"
// export { default as Dropdown } from "./form/input/Dropdown.svelte";
export {default as EmailInput} from "./form/input/EmailInput.svelte"
export {default as FileInput} from "./form/input/FileInput.svelte"
// export { default as Multiselect } from "./form/input/Multiselect.svelte";
export {default as NumberInput} from "./form/input/NumberInput.svelte"
export {default as Select} from "./form/input/Select.svelte"
export {default as Radio} from "./form/input/Radio.svelte"
export {default as RadioSimple} from "./form/input/RadioSimple.svelte"
export {default as RangeInput} from "./form/input/RangeInput.svelte"
export {default as Switch} from "./form/input/Switch.svelte"
export {default as Textarea} from "./form/input/Textarea.svelte"
export {default as TextInput} from "./form/input/TextInput.svelte"
export {default as PasswordInput} from "./form/input/PasswordInput.svelte"
export {default as PhoneInput} from "./form/input/PhoneInput.svelte"
export {default as UrlInput} from "./form/input/UrlInput.svelte"

/* [2.2] Form > Structure */
export {default as Form} from "./form/structure/Form.svelte"
export {default as FormGroup} from "./form/structure/FormGroup.svelte"
export {default as InputGroup} from "./form/structure/InputGroup.svelte"
export {default as InputGroupAppend} from "./form/structure/InputGroupAppend.svelte"
export {default as InputGroupPrepend} from "./form/structure/InputGroupPrepend.svelte"
export {default as Label} from "./form/structure/Label.svelte"

/* [4] Structure */
export {default as BreadcrumbItem} from "./structure/BreadcrumbItem.svelte"
export {default as Card} from "./structure/Card.svelte"
export {default as Modal} from "./structure/modals/Modal.svelte"
export {default as ConfirmModal} from "./structure/modals/ConfirmModal.svelte"
export {default as ConnectionClosedModal} from "./structure/modals/ConnectionClosedModal.svelte"
export {default as DeleteItemModal} from "./structure/modals/DeleteItemModal.svelte"
export {default as OneColumnNarrow} from "./structure/OneColumnNarrow.svelte"
export {default as PageHeader} from "./structure/PageHeader.svelte"
export {default as FlexContainer} from "./structure/FlexContainer.svelte"
export {default as WithLazyLoader} from "./structure/WithLazyLoader.svelte"
export {default as WithPermissions} from "./structure/WithPermissions.svelte"
export {default as WithRoles} from "./structure/WithRoles.svelte"

/* [4.1] Structure > Navigation */
export {default as BrandNavLogo} from "./structure/navigation/BrandNavLogo.svelte"
export {default as BrandNavLogoSidebar} from "./structure/navigation/BrandNavLogoSidebar.svelte"
export {default as MobileNavToggle} from "./structure/navigation/MobileNavToggle.svelte"
export {default as Sidebar} from "./structure/navigation/Sidebar.svelte"
export {default as SidebarNavItem} from "./structure/navigation/SidebarNavItem.svelte"
export {default as TopNavigation} from "./structure/navigation/TopNavigation.svelte"
export {default as TopNavItem} from "./structure/navigation/TopNavItem.svelte"
export {default as UserDropdownMenu} from "./structure/navigation/UserDropdownMenu.svelte"

/* [4.1.1] Structure > Navigation > Dropdown */
export {default as Dropdown} from "./structure/navigation/dropdown/Dropdown.svelte"
export {default as DropdownButton} from "./structure/navigation/dropdown/DropdownButton.svelte"
export {default as DropdownDivider} from "./structure/navigation/dropdown/DropdownDivider.svelte"
export {default as DropdownItem} from "./structure/navigation/dropdown/DropdownItem.svelte"
export {default as DropdownMenu} from "./structure/navigation/dropdown/DropdownMenu.svelte"

/* [4.1.2] Structure > Navigation > Tabs */
export {default as TabItem} from "./structure/navigation/tabs/TabItem.svelte"
export {default as Tabs} from "./structure/navigation/tabs/Tabs.svelte"

/* [5] Tables */
export {default as ErrorRow} from "./tables/ErrorRow.svelte"
export {default as LoadingRow} from "./tables/LoadingRow.svelte"
export {default as TableCondensed} from "./tables/TableCondensed.svelte"
export {default as TableCondensedWithHeader} from "./tables/TableCondensedWithHeader.svelte"
export {default as TableEmptyRow} from "./tables/TableEmptyRow.svelte"
export {default as TableRowFullWidth} from "./tables/TableRowFullWidth.svelte"

/* [6] UI */
export {default as AutoScroll} from "./ui/AutoScroll.svelte"
export {default as Badge} from "./ui/Badge.svelte"
export {default as BsProgress} from "./ui/BsProgress.svelte"
export {default as ButtonDropdown} from "./ui/dropdown/ButtonDropdown.svelte"
export {default as ButtonDropdownButton} from "./ui/dropdown/ButtonDropdownButton.svelte"
export {default as ButtonDropdownItem} from "./ui/dropdown/ButtonDropdownItem.svelte"
export {default as DropdownToggleButton} from "./ui/dropdown/DropdownToggleButton.svelte"
export {default as Callout} from "./ui/Callout.svelte"
export {default as InfoBox} from "./ui/widgets/InfoBox.svelte"
export {default as Loader} from "./ui/Loader.svelte"
export {default as LteButton} from "./ui/buttons/LteButton.svelte"
export {default as ButtonLink} from "./ui/buttons/ButtonLink.svelte"
export {default as AsyncButton} from "./ui/buttons/AsyncButton.svelte"
export {default as CloseIconButton} from "./ui/buttons/CloseIconButton.svelte"
export {default as AddButton} from "./ui/buttons/AddButton.svelte"
export {default as DeleteButton} from "./ui/buttons/DeleteButton.svelte"
export {default as DeleteButtonAsync} from "./ui/buttons/DeleteButtonAsync.svelte"
export {default as SaveButton} from "./ui/buttons/SaveButton.svelte"
export {default as SaveButtonAsync} from "./ui/buttons/SaveButtonAsync.svelte"
export {default as RefreshButton} from "./ui/buttons/RefreshButton.svelte"
export {default as RefreshButtonAsync} from "./ui/buttons/RefreshButtonAsync.svelte"
export {default as ButtonGroup} from "./ui/buttons/ButtonGroup.svelte"
export {default as LteLabel} from "./ui/LteLabel.svelte"
export {default as ModalCloseButton} from "./ui/ModalCloseButton.svelte"
export {default as Pagination} from "./ui/Pagination.svelte"
export {default as DraggableContainer} from "./ui/DraggableContainer.svelte"
export {default as ProgressBar} from "./ui/ProgressBar.svelte"
export {default as TippyTooltip} from "./ui/TippyTooltip.svelte"
export {default as SocialCard} from "./ui/widgets/SocialCard.svelte"
export {default as SimpleProgressBar} from "./ui/SimpleProgressBar.svelte"

/* [6.1] UI > Context menu */
export {default as ContextMenu} from "./ui/context-menu/ContextMenu.svelte"
export {default as ContextMenuDivider} from "./ui/context-menu/ContextMenuDivider.svelte"
export {default as ContextMenuEntry} from "./ui/context-menu/ContextMenuEntry.svelte"
export {default as ContextMenuLabel} from "./ui/context-menu/ContextMenuLabel.svelte"

/* [6.2] UI > Chat */
export {default as Chat} from "./ui/chat/Chat.svelte"
export {default as ChatMessage} from "./ui/chat/ChatMessage.svelte"

/* [7] Toasts */
export {default as Toastr} from "./toasts/toastr.js"
export {default as NotificationProvider, NotificationType} from "./toasts/notification-provider.js"
