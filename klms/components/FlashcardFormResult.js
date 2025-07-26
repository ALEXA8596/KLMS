import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';


function FlashcardFormResult({ result, onUseResult }) {
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState(null);

  const handleUseResult = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(result);
      if (onUseResult) {
        onUseResult(parsed);
      }
    } catch (e) {
      setParseError("Invalid JSON format. Please check the AI output.");
    }
  };

  return (
    <div className="FlashcardFormResult">
      {result != null ? (
        <div>
          <div className="bg-info bg-opacity-25 min-vh-25 p-4 m-4 rounded">
            <pre className="mb-0">{result}</pre>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <CopyToClipboard text={result} onCopy={() => setCopied(true)}>
              <button className="btn btn-primary ms-4 mb-3">Copy to Clipboard</button>
            </CopyToClipboard>
            {onUseResult && (
              <button className="btn btn-success ms-2 mb-3" onClick={handleUseResult}>
                Use in Form
              </button>
            )}
            {copied && <span className="ms-2 text-success">Copied!</span>}
          </div>
          {parseError && <div className="text-danger mt-2">{parseError}</div>}
        </div>
      ) : null}
    </div>
  );
}

export default FlashcardFormResult;
