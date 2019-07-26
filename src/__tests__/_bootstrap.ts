import { create, GithubClient } from "../services/github";
import { analyze } from "../analyze";
import { setCheckRuns } from "../checkRuns";
import { generateReport } from "../report";
import { setComment } from "../comment";
import { getLatestRelease } from "../getLatestRelease";
import { generateCheckRuns } from "../report/checkRuns";
import { Control } from "../analyze/control";

jest.setTimeout(60000);

export const bootstrap = ({ pullRequest, installation }) => {
  let re;
  let controls: Control[];
  let github: GithubClient;

  it("should init github client (eventually)", async () => {
    let k = 5;
    while (!github) {
      try {
        github = await create(installation.id);
      } catch (error) {
        if (k-- < 0) throw error;
      }
    }

    expect(github).toBeTruthy();
  });

  it("should get the latest release", async () => {
    re = await getLatestRelease({ github })(pullRequest);

    // expect(re).toBeTruthy();
  });

  it("should analyze", async () => {
    controls = await analyze({ github })(pullRequest, re && re.release);

    expect(controls.length).toBeGreaterThan(1);

    expect(controls).toMatchSnapshot();
  });

  it("should generate report", () => {
    const report = generateReport(re && re.release, controls);

    expect(report).toMatchSnapshot();
  });

  it("should generate checks", () => {
    const checks = generateCheckRuns(controls);

    expect(checks).toMatchSnapshot();
  });

  it("should report", async () => {
    await setComment({ github })(
      pullRequest,
      generateReport(re && re.release, controls)
    );
  });

  it("should report checks", async () => {
    re &&
      (await setCheckRuns({ github })(
        pullRequest.base.repo,
        re.sha,
        re && re.release.id,
        generateCheckRuns(controls)
      ));
  });
};
