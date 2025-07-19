import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function QuizFormResult({ result }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="QuizFormResult">
      {result != null ? (
        <div>
          <div className="bg-info bg-opacity-25 min-vh-25 p-4 m-4 rounded">
            <pre className="mb-0">{result}</pre>
          </div>
          <div>
            <CopyToClipboard text={result} onCopy={() => setCopied(true)}>
              <button className="btn btn-primary ms-4 mb-3">Copy to Clipboard</button>
            </CopyToClipboard>
            {copied && <span className="ms-2 text-success">Copied!</span>}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default QuizFormResult;
