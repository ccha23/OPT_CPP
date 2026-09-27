// Python Tutor: https://github.com/pgbovine/OnlinePythonTutor/
// Copyright (C) Philip Guo (philip@pgbovine.net)
// LICENSE: https://github.com/pgbovine/OnlinePythonTutor/blob/master/LICENSE.txt

import { assert, htmlspecialchars } from './pytutor';
import { OptFrontend } from './opt-frontend';
import { initVisualizeAI } from './visualize-ai';
import { initOptShell } from './opt-shell';
import { bindEditorTheme } from './theme';
require('./lib/jquery-3.0.0.min.js');
require('./lib/jquery.qtip.js');
require('../css/jquery.qtip.css');
require('../css/opt-theme.css');
require('../css/opt-shell.css');
require('../css/opt-codemirror-theme.css');
require('../css/opt-viz-theme.css');

// for TypeScript
declare var initCodeopticon: any; // FIX later when porting Codeopticon


$(document).ready(function () {
  var params = {};
  var optOverride = (window as any).optOverride;
  // super hacky!
  if (optOverride) {
    (params as any).disableLocalStorageToggles = true;
  }

  var optFrontend = new OptFrontend(params);
  initVisualizeAI({
    getCode: () => {
      const vizCode = (optFrontend.myVisualizer as any)?.curInputCode;
      return (typeof vizCode === "string" && vizCode.length > 0)
        ? vizCode
        : optFrontend.pyInputGetValue();
    },
  });

  (window as any).optFrontend = optFrontend; // purposely leak to globals to ease debugging!!!


  $('#pythonVersionSelector').change(optFrontend.setAceMode.bind(optFrontend));
  optFrontend.setAceMode();

  if (typeof initCodeopticon !== "undefined") {
    initCodeopticon(); // defined in codeopticon-learner.js
  }

  $("#liveModeBtn").click(optFrontend.openLiveModeUrl.bind(optFrontend));

  // Layout shell: pinned nav bar (mode tabs + permalink + theme) + resizable
  // bands (AI chat at the bottom, code/visualizer in the main band). Runs last
  // so all legacy ID-based handlers are bound before we relocate nodes.
  const buildPermalink = () => {
    const myArgs = optFrontend.getAppState();
    let urlStr = $.param.fragment(window.location.href, myArgs, 2); // 2 = override
    return String(urlStr).replace(/\(/g, "%28").replace(/\)/g, "%29");
  };
  initOptShell({
    page: "visualize",
    brand: "OPT C++",
    aiPaneId: "visualize-ai-panel",
    buildPermalink,
    navigate: (target) => {
      if (target === "live") optFrontend.openLiveModeUrl();
      else optFrontend.openVisualizeUrl();
    },
  });

  // Re-paint the CM6 editor's token colors whenever the theme changes.
  bindEditorTheme((optFrontend as any).pyInputAceEditor);
});
