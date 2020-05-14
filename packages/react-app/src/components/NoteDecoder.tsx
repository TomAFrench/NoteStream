import { useState, useEffect, ReactElement } from 'react';

import { Hash } from '../types/types';

const NoteDecoder = ({
  render,
  zkNote,
  noteHash,
}: {
  render: Function;
  zkNote: any;
  noteHash: Hash;
}): ReactElement => {
  const [note, setNote] = useState({});

  useEffect(() => {
    const decodeNote = async (hash: Hash, i = 1): Promise<void> => {
      const decodedNote = await zkNote(hash);
      if (decodedNote.valid) {
        setNote(decodedNote);
      } else if (i < 10) {
        // There seems to be an issue where on initial loadup where zkNote always returns an invalid note.
        // On subsequent renders after the aztec sdk has loaded fully then this works fine.
        // We then add a simple limited retry logic to fix the initial render.
        setTimeout(() => {
          decodeNote(hash, i + 1);
        }, 400);
      }
    };

    if (zkNote) {
      decodeNote(noteHash);
    }
  }, [zkNote, noteHash]);

  return render(note);
};

export default NoteDecoder;
