import { useState, useEffect, ReactElement } from 'react';

import { Hash } from '../types/types';

const NoteDecoder = ({ render, zkNote, noteHash }: { render: Function; zkNote: any; noteHash: Hash }): ReactElement => {
  const [note, setNote] = useState({});

  useEffect(() => {
    if (zkNote) {
      zkNote(noteHash).then((decodedNote: object) => setNote(decodedNote));
    }
  }, [zkNote, noteHash]);

  return render(note);
};

export default NoteDecoder;
