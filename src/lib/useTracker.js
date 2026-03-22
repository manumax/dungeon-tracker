import { useState, useEffect, useCallback, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { makeInitialState, migrateState, METADATA_KEY } from "./constants.js";

export function useTracker() {
  const [ready, setReady]    = useState(false);
  const [isGM, setIsGM]      = useState(false);
  const [state, _setState]   = useState(makeInitialState);
  const localStateRef         = useRef(makeInitialState());
  const unsubMetaRef         = useRef(null);

  useEffect(() => {
    let isMounted = true;

    OBR.onReady(async () => {
      if (!isMounted) return;
      setReady(true);

      const role = await OBR.player.getRole();
      if (!isMounted) return;
      setIsGM(role === "GM");

      const meta = await OBR.room.getMetadata();
      if (!isMounted) return;
      if (meta[METADATA_KEY]) {
        const migrated = migrateState(meta[METADATA_KEY]);
        localStateRef.current = migrated;
        _setState(migrated);
      }

      unsubMetaRef.current = OBR.room.onMetadataChange((meta) => {
        if (!isMounted) return;
        const incoming = meta[METADATA_KEY];
        if (!incoming) return;
        const migrated = migrateState(incoming);
        const currentJson = JSON.stringify(localStateRef.current);
        const incomingJson = JSON.stringify(migrated);
        if (currentJson !== incomingJson) {
          localStateRef.current = migrated;
          _setState(migrated);
        }
      });
    });

    return () => {
      isMounted = false;
      if (typeof unsubMetaRef.current === "function") {
        unsubMetaRef.current();
      }
    };
  }, []);

  const setState = useCallback((updater) => {
    _setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStateRef.current = next;
      // NOTE: No conflict resolution — last write wins if multiple GMs edit simultaneously
      OBR.room.setMetadata({ [METADATA_KEY]: next }).catch(console.error);
      return next;
    });
  }, []);

  return { state, setState, ready, isGM };
}
