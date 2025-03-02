# WeSplit

WeSplit is an expense-splitting app that helps groups manage shared purchases and events. It supports creating events, logging purchases (manually or via QR code scanning of fiscal receipts), automatic balance calculation, and debt tracking—all wrapped in a user-friendly, multi-platform experience (PWA-ready).

## Features

- **Event Management:** Create, view, edit, and delete events.
- **Purchase Logging:** Add and edit purchases manually or by scanning QR codes from fiscal receipts.
- **Balance Calculation:** Automatically compute who owes what.
- **Debt Tracking:** Mark debts as repaid.
- **Activity Log:** Keep track of all event actions.
- **Multi-Platform & PWA:** Use on desktops and mobile devices.
- **Localization & Currency Support:** Multiple languages and currencies.
- **Theming:** Choose between light, dark, or automatic themes.

## Project Structure

- **api/** – API integration for receipt scanning.
- **public/** – Static assets, icons, and localization files.
- **src/** – Main Angular app including components, models, shared services, and utilities.

## Getting Started

**Install dependencies:**

 ```bash
 npm install
 ```

**Copy and fill environment:**

 ```bash
cp .env.sample .env
 ```

**Run the app:**

- For a standard development server:
 ```bash
 npm run start
 ```

- Or using Vercel's local environment:
 ```bash
 npm run start:server
 ```

**Build the project:**

```bash
npm run build
```

**Run tests:**

```bash
npm run test
```

## Additional Commands

- **`prepare`** – Sets up Git hooks.
- **`lint`** – Runs all lint checks (code, formatting, styles, types).

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is released under the MIT License.
