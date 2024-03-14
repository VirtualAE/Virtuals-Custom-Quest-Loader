using UnityEngine;
using EFT;
using EFT.UI;
using EFT.Interactive;

namespace VCQLQuestZones.Core
{
    public class ZoneFlareTrigger : TriggerWithId
    {
        public int Experience;

        void Awake()
        {
            gameObject.layer = LayerMask.NameToLayer("Triggers");
        }

        protected override void TriggerEnter(Player player)
        {
            base.TriggerEnter(player);
#if DEBUG
            ConsoleScreen.Log("VCQL: Entered Flare Zone.");
#endif
        }
    }
}
