import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const loadAppInfo = (): any => {
  const pathName = "appInfo.json";
  const filePath = path.join(__dirname, pathName);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return {};
};

const appInfo = loadAppInfo();

export class Version {
  /**
   * Retrieves the application description from the environment variable APP_DESCRIPTION.
   * If the environment variable is not set, it returns the description from appInfo or "No description available".
   *
   * @returns {string} The application description or a default message if not defined.
   */
  public static getDescription(): string {
    return process.env.APP_DESCRIPTION || appInfo.APP_DESCRIPTION || "No description available";
  }

  /**
   * Retrieves the application name from the environment variable APP_NAME.
   * If the environment variable is not set, it returns the name from appInfo or "No name available".
   *
   * @returns {string} The application name or a default message if not defined.
   */
  public static getName(): string {
    return process.env.APP_NAME || appInfo.APP_NAME || "No name available";
  }

  /**
   * Retrieves the current version of the application from the environment variable APP_VERSION.
   * If the environment variable is not set, it returns the version from appInfo or "unknown".
   *
   * @returns {string} The application version or "unknown" if not defined.
   */
  public static getVersion(): string {
    return process.env.APP_VERSION || appInfo.APP_VERSION || "unknown";
  }

  /**
   * Verifies if the current version of the application matches the expected version.
   * Utilizes the getVersion method to obtain the current version.
   *
   * @param {string} expectedVersion - The version that is expected for the application.
   * @returns {boolean} Returns true if the current version matches the expected version; otherwise, returns false.
   */
  public static verifyVersion(expectedVersion: string): boolean {
    return this.getVersion() === expectedVersion;
  }
}