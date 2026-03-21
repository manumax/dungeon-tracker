import { useState, useEffect, useCallback, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { makeInitialState, METADATA_KEY } from "./constants.js";

/**
 * useTracker
 *
 * Manages tracker state synced to OBR room metadata.
 * SDK v3.x: OBR.onReady() returns void, no cleanup needed.
 */
export function useTracker() {
  const [ready, setReady]   = useState(false);
  const [isGM, setIsGM]     = useState(false);
  const [state, _setState]  = useState(makeInitialState);
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
        _setState(meta[METADATA_KEY]);
      }

      unsubMetaRef.current = OBR.room.onMetadataChange((meta) => {
        if (!isMounted) return;
        if (meta[METADATA_KEY]) {
          _setState(meta[METADATA_KEY]);
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
      OBR.room.setMetadata({ [METADATA_KEY]: next }).catch(console.error);
      return next;
    });
  }, []);

  return { state, setState, ready, isGM };
}
